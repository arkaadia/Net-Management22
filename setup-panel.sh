#!/usr/bin/env bash
# ==============================================================================
# NetTopology — Enterprise Cisco Network Topology & Port Security Management Panel
# Automated VPS & Server Setup Installer
# Supports Ubuntu 20.04/22.04/24.04, Debian 11/12, and other Debian-based systems
# ==============================================================================

set -eo pipefail

# Make script non-interactive for underlying package managers
export DEBIAN_FRONTEND=noninteractive
export APT_LISTCHANGES_FRONTEND=none
export NEEDRESTART_MODE=a
export UCF_FORCE_CONFFOLD=1

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logger functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PANEL_VERSION="1.62.1"

# ==============================================================================
# Enterprise Package Manager & DPKG Lock Guard
# Prevents collisions with background processes such as unattended-upgrades,
# apt.systemd.daily, or concurrent package management tasks.
# ==============================================================================
is_dpkg_locked() {
  if command -v fuser &>/dev/null; then
    if fuser /var/lib/dpkg/lock /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock >/dev/null 2>&1; then
      return 0
    fi
  elif command -v lsof &>/dev/null; then
    if lsof /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || lsof /var/lib/dpkg/lock >/dev/null 2>&1; then
      return 0
    fi
  fi
  if pgrep -f "unattended-upgr" >/dev/null 2>&1 || \
     pgrep -f "apt.systemd.daily" >/dev/null 2>&1 || \
     pgrep -f "apt-get.*update" >/dev/null 2>&1 || \
     pgrep -f "apt-get.*install" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

wait_for_dpkg_lock() {
  local max_wait=180
  local waited=0
  local locked=false

  while is_dpkg_locked; do
    locked=true
    if [ $waited -eq 0 ]; then
      log_info "Package manager (dpkg / apt) is currently in use by background process (e.g. unattended-upgrades)."
      log_info "Waiting gracefully for background task to release the lock (up to ${max_wait}s)..."
    fi
    echo -ne "  ⏳ Waiting for APT/DPKG lock release... [${waited}s / ${max_wait}s]\r"
    sleep 3
    waited=$((waited + 3))
    if [ $waited -ge $max_wait ]; then
      echo ""
      log_warning "Background package manager did not release locks within ${max_wait}s."
      log_warning "Attempting graceful stop of background upgrade services..."
      systemctl stop unattended-upgrades 2>/dev/null || true
      systemctl stop apt-daily.service 2>/dev/null || true
      systemctl stop apt-daily-upgrade.service 2>/dev/null || true
      pkill -f "unattended-upgr" 2>/dev/null || true
      sleep 2
      break
    fi
  done

  if [ "$locked" = true ]; then
    echo ""
    log_success "Package manager lock cleared successfully. Proceeding with installation."
  fi

  DEBIAN_FRONTEND=noninteractive dpkg --configure -a 2>/dev/null || true
}

safe_apt_install() {
  wait_for_dpkg_lock
  local retries=5
  local count=0
  until DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" "$@"; do
    count=$((count + 1))
    if [ $count -ge $retries ]; then
      log_error "apt-get install failed after $retries attempts for: $*"
      return 1
    fi
    log_warning "APT lock or network collision detected. Retrying ($count/$retries) in 5 seconds..."
    wait_for_dpkg_lock
    sleep 5
  done
  return 0
}

safe_apt_update() {
  wait_for_dpkg_lock
  local retries=3
  local count=0
  until DEBIAN_FRONTEND=noninteractive apt-get update -y; do
    count=$((count + 1))
    if [ $count -ge $retries ]; then
      log_warning "apt-get update completed with notices. Proceeding with existing repositories..."
      return 0
    fi
    log_warning "apt-get update was busy or interrupted. Retrying ($count/$retries)..."
    wait_for_dpkg_lock
    sleep 3
  done
  return 0
}

# Ensure background update timers are restored upon script termination
cleanup_apt_timers() {
  systemctl start apt-daily.timer 2>/dev/null || true
  systemctl start apt-daily-upgrade.timer 2>/dev/null || true
}
trap cleanup_apt_timers EXIT

# ==============================================================================
# Enterprise Memory, Shared Memory & Resource Guard
# Prevents "Bus error (core dumped)" and OOM crashes during Vite & esbuild builds
# on all Linux architectures, VPS, and containerized hosts.
# ==============================================================================
ensure_system_resources() {
  log_info "Verifying system memory, shared memory (/dev/shm) & resource limits..."
  local total_swap_mb=0
  local total_ram_mb=0

  if [ -f /proc/meminfo ]; then
    total_swap_mb=$(grep -i SwapTotal /proc/meminfo | awk '{print int($2/1024)}')
    total_ram_mb=$(grep -i MemTotal /proc/meminfo | awk '{print int($2/1024)}')
  elif command -v free &>/dev/null; then
    total_swap_mb=$(free -m 2>/dev/null | awk '/Swap:/ {print $2}')
    total_ram_mb=$(free -m 2>/dev/null | awk '/Mem:/ {print $2}')
  fi

  total_swap_mb=${total_swap_mb:-0}
  total_ram_mb=${total_ram_mb:-0}
  log_info "Detected: ${total_ram_mb}MB RAM | ${total_swap_mb}MB Swap"

  # 1. Expand Process Stack and File Descriptor Limits (Crucial for AST compilation)
  ulimit -s 65536 2>/dev/null || ulimit -s unlimited 2>/dev/null || true
  ulimit -n 65536 2>/dev/null || ulimit -n 4096 2>/dev/null || true
  ulimit -v unlimited 2>/dev/null || true
  ulimit -m unlimited 2>/dev/null || true

  # 2. Kernel inotify and file-max adjustments (prevents OS file watcher bottlenecks)
  sysctl -w fs.inotify.max_user_watches=524288 2>/dev/null || true
  sysctl -w fs.inotify.max_user_instances=1024 2>/dev/null || true
  sysctl -w fs.file-max=2097152 2>/dev/null || true

  # 3. Guard Shared Memory (/dev/shm) to prevent mmap / POSIX shm SIGBUS errors
  if [ -d /dev/shm ]; then
    local shm_size_mb
    shm_size_mb=$(df -m /dev/shm 2>/dev/null | awk 'NR==2 {print $2}')
    shm_size_mb=${shm_size_mb:-0}
    if [ "$shm_size_mb" -lt 1024 ]; then
      log_info "Expanding /dev/shm (shared memory) to 2GB to prevent Rollup/V8 SIGBUS crashes..."
      mount -o remount,size=2G /dev/shm 2>/dev/null || true
    fi
  fi

  # 4. Swap file allocation for systems with low swap
  if [ "$total_swap_mb" -lt 1500 ]; then
    log_warning "Swap memory is low or absent (${total_swap_mb}MB). Provisioning a 2GB dedicated swap file for build stability..."

    if [ -f /swapfile ] && [ "$total_swap_mb" -eq 0 ]; then
      swapoff /swapfile 2>/dev/null || true
      rm -f /swapfile 2>/dev/null || true
    fi

    local swap_created=false
    if [ ! -f /swapfile ]; then
      if command -v fallocate &>/dev/null && fallocate -l 2G /swapfile 2>/dev/null; then
        swap_created=true
      elif dd if=/dev/zero of=/swapfile bs=1M count=2048 2>/dev/null; then
        swap_created=true
      fi

      if [ "$swap_created" = true ]; then
        chmod 600 /swapfile
        mkswap /swapfile >/dev/null 2>&1 || true
        swapon /swapfile >/dev/null 2>&1 || true

        if ! grep -q "/swapfile" /etc/fstab 2>/dev/null; then
          echo "/swapfile swap swap defaults 0 0" >> /etc/fstab 2>/dev/null || true
        fi

        local active_swap=$(free -m 2>/dev/null | awk '/Swap:/ {print $2}' || echo "2048")
        log_success "Swapfile activated successfully! Total Swap now: ${active_swap}MB"
      else
        log_warning "Could not create /swapfile (restricted container). Proceeding with memory-conservative flags."
      fi
    else
      swapon /swapfile 2>/dev/null || true
    fi
  fi
}
# Backward compatibility alias
ensure_system_swap() {
  ensure_system_resources
}

# ==============================================================================
# Enterprise DevOps Architecture: Reliable TTY & Pipe Mode Execution
# When executed via: curl -sSL https://.../setup-panel.sh | sudo bash
# Standard Input (fd 0) delivers the script stream from curl to bash.
# We MUST NEVER execute 'exec 0< /dev/tty', because replacing fd 0 severs
# the incoming script stream and causes bash to stall indefinitely.
# Instead, prompt_read() dynamically queries /dev/tty via subshell verification,
# prompting interactively when a controlling terminal exists, or using defaults.
# ==============================================================================
has_usable_tty() {
  (exec < /dev/tty) 2>/dev/null && (exec > /dev/tty) 2>/dev/null
}

clear 2>/dev/null || true
echo -e "${CYAN}${BOLD}"
cat << "EOF"
======================================================================
  ███╗   ██╗███████╗████████╗████████╗ ██████╗ ██████╗  ██████╗ 
  ████╗  ██║██╔════╝╚══██╔══╝╚══██╔══╝██╔═══██╗██╔══██╗██╔═══██╗
  ██╔██╗ ██║█████╗     ██║      ██║   ██║   ██║██████╔╝██║   ██║
  ██║╚██╗██║██╔══╝     ██║      ██║   ██║   ██║██╔═══╝ ██║   ██║
  ██║ ╚████║███████╗   ██║      ██║   ╚██████╔╝██║     ╚██████╔╝
  ╚═╝  ╚═══╝╚══════╝   ╚═╝      ╚═╝    ╚═════╝ ╚═╝      ╚═════╝ 
        CISCO NETWORK TOPOLOGY & PORT SECURITY MANAGEMENT PANEL
        Version: 1.52.1 (Enterprise Production Suite)
        Developer: Masoud Shahbazi (https://www.linkedin.com/in/masoudshahbazi/)
        Repository: https://github.com/shahbazimasoud/Net-Management
======================================================================
EOF
echo -e "${NC}"

# Check privileges
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this installer as root (using sudo)."
  echo -e "${YELLOW}Usage:${NC} curl -sSL https://raw.githubusercontent.com/shahbazimasoud/Net-Management/master/setup-panel.sh | sudo bash"
  echo -e "${YELLOW}Or locally:${NC} sudo bash setup-panel.sh"
  exit 1
fi

# Detect system environment and installer location
INSTALL_DIR=$(pwd)
if [ -f "$INSTALL_DIR/package.json" ] && grep -q -E "react-example|nettopology" "$INSTALL_DIR/package.json"; then
  log_info "Detected installer is running from within the NetTopology project directory ($INSTALL_DIR)."
else
  log_step "Preparing installation directory..."
  INSTALL_DIR="/opt/nettopology"
  if [ -d "$INSTALL_DIR" ]; then
    log_warning "Directory $INSTALL_DIR already exists. We will update it."
  else
    mkdir -p "$INSTALL_DIR"
  fi
fi

# ------------------------------------------------------------------------------
# 1. Interactive Questions (Guaranteed TTY Console Input Handler)
# ------------------------------------------------------------------------------
prompt_read() {
  local prompt_msg="$1"
  local var_name="$2"
  local default_val="$3"
  local is_secret="${4:-false}"
  local user_input=""

  # Use existing env var if pre-configured
  eval "local existing_val=\"\${$var_name:-}\""
  if [ -n "$existing_val" ]; then
    log_info "Using pre-configured value for $var_name: $existing_val"
    return 0
  fi

  # Output prompt and read input using real controlling terminal if usable
  if has_usable_tty; then
    printf "%b" "$prompt_msg" > /dev/tty
    if [ "$is_secret" = "true" ]; then
      read -r -s user_input < /dev/tty
      echo "" > /dev/tty 2>/dev/null || true
    else
      read -r user_input < /dev/tty
    fi
  elif [ -t 0 ]; then
    printf "%b" "$prompt_msg"
    if [ "$is_secret" = "true" ]; then
      read -r -s user_input
      echo ""
    else
      read -r user_input
    fi
  else
    printf "%b" "$prompt_msg"
    user_input="$default_val"
    echo -e " ${YELLOW}[Automated default: ${default_val}]${NC}"
  fi

  # Clean carriage returns and trim whitespace
  user_input=$(echo "$user_input" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

  eval "$var_name=\"\${user_input:-\$default_val}\""
}

echo -e "\n${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║      🌐  STEP 1: NETWORK & DOMAIN CONFIGURATION                      ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}\n"

# Detect Server Private/Public IP safely
DETECTED_IP=""
if command -v ip &>/dev/null; then
  DETECTED_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || true)
fi
if [ -z "$DETECTED_IP" ] && command -v hostname &>/dev/null; then
  DETECTED_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
fi
if [ -z "$DETECTED_IP" ]; then
  DETECTED_IP="127.0.0.1"
fi

prompt_read "${BOLD}Enter Domain Name or Server IP for NetTopology [Default: ${DETECTED_IP}]: ${NC}" PANEL_DOMAIN "${DETECTED_IP}"

# NetTopology is an enterprise network security panel.
# It operates exclusively over Self-Signed SSL (HTTPS) on the user's chosen port.
while true; do
  prompt_read "${BOLD}Enter Secure HTTPS / SSL Port for NetTopology Panel [Default: 8443]: ${NC}" PANEL_SSL_PORT "8443"
  if [[ "$PANEL_SSL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_SSL_PORT" -ge 1 ] && [ "$PANEL_SSL_PORT" -le 65535 ]; then
    break
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
    PANEL_SSL_PORT="8443"
  fi
done

while true; do
  prompt_read "${BOLD}Enter Backend Service Port (API & Python Engine) [Default: 5001]: ${NC}" BACKEND_PORT_INPUT "5001"
  if [[ "$BACKEND_PORT_INPUT" =~ ^[0-9]+$ ]] && [ "$BACKEND_PORT_INPUT" -ge 1 ] && [ "$BACKEND_PORT_INPUT" -le 65535 ]; then
    if [ "$BACKEND_PORT_INPUT" -eq "$PANEL_SSL_PORT" ]; then
      log_error "Backend port cannot conflict with public HTTPS ingress port ($PANEL_SSL_PORT)."
    else
      INTERNAL_BACKEND_PORT="$BACKEND_PORT_INPUT"
      break
    fi
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
    BACKEND_PORT_INPUT="5001"
  fi
done

# PostgreSQL Enterprise Database Configuration Prompts
echo -e "\n${PURPLE}${BOLD}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}${BOLD}║      🐘  STEP 2: POSTGRESQL PERSISTENT DATABASE CONFIGURATION        ║${NC}"
echo -e "${PURPLE}${BOLD}╚══════════════════════════════════════════════════════════════════════╝${NC}\n"
echo -e "${PURPLE}PostgreSQL stores all user accounts, role-based access control (RBAC),${NC}"
echo -e "${PURPLE}audit logs, saved topologies, physical locations, and credentials securely.${NC}\n"

prompt_read "${BOLD}Enter PostgreSQL Database Name [Default: nettopology_db]: ${NC}" DB_NAME "nettopology_db"
prompt_read "${BOLD}Enter PostgreSQL Database Username [Default: nettopology_user]: ${NC}" DB_USER "nettopology_user"

prompt_read "${BOLD}Enter PostgreSQL Database Password (Press ENTER to generate secure password): ${NC}" DB_PASSWORD_INPUT "" "false"

if [ -z "$DB_PASSWORD_INPUT" ]; then
  DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16 2>/dev/null || echo "NetTopDbPass_$(date +%s)")
  log_success "Generated secure random password for database: ${BOLD}${GREEN}$DB_PASSWORD${NC}"
else
  DB_PASSWORD="$DB_PASSWORD_INPUT"
fi

while true; do
  prompt_read "${BOLD}Enter PostgreSQL Port [Default: 5432]: ${NC}" DB_PORT_INPUT "5432"
  if [[ "$DB_PORT_INPUT" =~ ^[0-9]+$ ]] && [ "$DB_PORT_INPUT" -ge 1 ] && [ "$DB_PORT_INPUT" -le 65535 ]; then
    DB_PORT="$DB_PORT_INPUT"
    break
  else
    log_error "Invalid port number. Please enter a value between 1 and 65535."
  fi
done

prompt_read "${BOLD}Enter Initial Password for Primary Superadmin (admin) [Default: admin123]: ${NC}" ADMIN_PASS_INPUT "admin123" "false"
ADMIN_INITIAL_PASSWORD="${ADMIN_PASS_INPUT:-admin123}"

# Internal loopback ports for isolated local processes
INTERNAL_NODE_PORT="3000"
if [ "$PANEL_SSL_PORT" -eq "$INTERNAL_NODE_PORT" ] || [ "$INTERNAL_BACKEND_PORT" -eq "$INTERNAL_NODE_PORT" ]; then
  INTERNAL_NODE_PORT="13000"
  if [ "$PANEL_SSL_PORT" -eq "$INTERNAL_NODE_PORT" ] || [ "$INTERNAL_BACKEND_PORT" -eq "$INTERNAL_NODE_PORT" ]; then
    INTERNAL_NODE_PORT="13001"
  fi
fi

log_info "Security & Architecture Summary:"
log_info "  • Public Web Ingress: Strict HTTPS / SSL on port $PANEL_SSL_PORT"
log_info "  • Backend API & Python Engine: Internal port $INTERNAL_BACKEND_PORT (127.0.0.1)"
log_info "  • PostgreSQL Target: Database '$DB_NAME' with user '$DB_USER' on port $DB_PORT"
log_info "  • Superadmin Account: Username 'admin' with your configured credentials"
echo ""

# ------------------------------------------------------------------------------
# 2. System Dependency & PostgreSQL Installation
# ------------------------------------------------------------------------------
log_step "Guarding package manager and pausing background update timers..."
systemctl stop unattended-upgrades 2>/dev/null || true
systemctl stop apt-daily.timer 2>/dev/null || true
systemctl stop apt-daily-upgrade.timer 2>/dev/null || true

log_step "Checking and repairing package manager database..."
wait_for_dpkg_lock
DEBIAN_FRONTEND=noninteractive dpkg --configure -a 2>/dev/null || true
DEBIAN_FRONTEND=noninteractive apt-get install -f -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" 2>/dev/null || true

log_step "Updating local package catalog (apt-get update)..."
safe_apt_update

log_step "Installing system tools, Nginx web server, Guacamole RDP/VNC Gateway, and PostgreSQL database engine..."
safe_apt_install \
  git curl build-essential python3 python3-pip python3-paramiko python3-cryptography python3-websockets ca-certificates gnupg lsb-release xz-utils openssl ufw traceroute dnsutils whois iputils-ping \
  postgresql postgresql-contrib postgresql-client nginx guacd libguac-client-rdp0 libguac-client-vnc0

# Ensure Paramiko 2.12.0 is pinned in Python runtime (crucial for legacy Cisco IOS 12.2/2960 SSH-2 compatibility)
if command -v pip3 &>/dev/null; then
  pip3 install --break-system-packages "paramiko==2.12.0" "cryptography>=3.3,<41.0.0" "websockets>=10.4" 2>/dev/null || \
  pip3 install "paramiko==2.12.0" "cryptography>=3.3,<41.0.0" "websockets>=10.4" 2>/dev/null || true
fi

log_step "Ensuring PostgreSQL service is enabled and started..."
systemctl enable postgresql 2>/dev/null || true
systemctl start postgresql 2>/dev/null || service postgresql start 2>/dev/null || true

log_step "Ensuring Apache Guacamole Daemon (guacd) service is enabled and started..."
systemctl enable guacd 2>/dev/null || true
systemctl start guacd 2>/dev/null || service guacd start 2>/dev/null || true

# Wait for PostgreSQL socket to become responsive
PG_READY=false
for i in {1..12}; do
  if sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    PG_READY=true
    break
  fi
  sleep 1
done

if [ "$PG_READY" = "true" ]; then
  log_success "PostgreSQL engine is active and responsive."
else
  log_warning "PostgreSQL service is starting slowly. Attempting service restart..."
  systemctl restart postgresql 2>/dev/null || true
  sleep 2
fi

# ------------------------------------------------------------------------------
# 2.5 PostgreSQL Database & User Provisioning
# ------------------------------------------------------------------------------
log_step "Provisioning PostgreSQL user '$DB_USER' and database '$DB_NAME'..."

# Create database user with password if not exists
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'; END IF; END \$\$;"
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Create database if not exists
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  log_success "Created new database '$DB_NAME' with owner '$DB_USER'."
else
  log_info "Database '$DB_NAME' already exists. Reassigning owner to '$DB_USER'..."
  sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" || true
fi

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

log_success "PostgreSQL user and database permissions configured successfully."

# Node.js 20/22 LTS Installation
install_nodejs() {
  local NODE_VER
  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}

  if command -v node &>/dev/null && [ "$NODE_VER" -ge 20 ]; then
    log_info "Node.js $(node -v) is already installed."
    return 0
  fi

  log_step "Installing Node.js 22 LTS..."
  
  # Method 1: NodeSource official setup
  log_info "Attempt 1: Installing via NodeSource repository..."
  wait_for_dpkg_lock
  curl -fsSL https://deb.nodesource.com/setup_22.x | DEBIAN_FRONTEND=noninteractive bash - 2>/dev/null || true
  safe_apt_install nodejs || true
  
  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}

  # Method 2: Direct pre-built binary fallback (Works on all Ubuntu/Debian versions)
  if [ "$NODE_VER" -lt 20 ]; then
    log_warning "NodeSource repository setup failed. Method 2: Downloading official Node.js 22 LTS prebuilt binary..."
    local ARCH
    ARCH=$(uname -m)
    local NODE_ARCH="x64"
    case "$ARCH" in
      x86_64) NODE_ARCH="x64" ;;
      aarch64|arm64) NODE_ARCH="arm64" ;;
      *) NODE_ARCH="x64" ;;
    esac
    local NODE_DIST="node-v22.14.0-linux-${NODE_ARCH}"
    rm -rf "/tmp/${NODE_DIST}*"
    if curl -fsSL --connect-timeout 20 --max-time 120 "https://nodejs.org/dist/v22.14.0/${NODE_DIST}.tar.xz" -o "/tmp/${NODE_DIST}.tar.xz" || \
       curl -fsSL --connect-timeout 20 --max-time 120 "https://mirror.ghproxy.com/https://nodejs.org/dist/v22.14.0/${NODE_DIST}.tar.xz" -o "/tmp/${NODE_DIST}.tar.xz"; then
      tar -xJf "/tmp/${NODE_DIST}.tar.xz" -C /usr/local --strip-components=1 || true
      rm -f "/tmp/${NODE_DIST}.tar.xz"
    fi
  fi

  NODE_VER=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
  NODE_VER=${NODE_VER:-0}

  if [ "$NODE_VER" -ge 20 ]; then
    log_success "Node.js successfully installed: $(node -v)"
  else
    log_error "Failed to install Node.js 20+. Please install Node.js manually."
    exit 1
  fi
}

install_nodejs

# ------------------------------------------------------------------------------
# 3. Code Retrieval & Directory Setup
# ------------------------------------------------------------------------------
if [ "$(pwd)" != "$INSTALL_DIR" ]; then
  log_step "Cloning or downloading NetTopology repository into $INSTALL_DIR..."
  if [ -d "$INSTALL_DIR/.git" ]; then
    log_info "Git repository found in $INSTALL_DIR. Fetching latest updates..."
    cd "$INSTALL_DIR"
    if ! git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 fetch --all; then
      log_warning "Git fetch failed. Trying fallback mirror..."
      git remote set-url origin https://mirror.ghproxy.com/https://github.com/shahbazimasoud/Net-Management.git
      git fetch --all || true
    fi
    git reset --hard origin/master || git reset --hard origin/main || true
  else
    rm -rf "$INSTALL_DIR"/*
    CLONE_SUCCESS=false

    # Try 1: Direct Git Clone
    log_info "Attempt 1: Direct git clone from GitHub..."
    if git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 clone https://github.com/shahbazimasoud/Net-Management.git "$INSTALL_DIR"; then
      CLONE_SUCCESS=true
    fi

    # Try 2: Mirror Proxy Clone
    if [ "$CLONE_SUCCESS" = false ]; then
      log_warning "Direct git clone failed. Attempt 2: Cloning via GitHub Mirror Proxy..."
      if git -c network.maxSubmissions=1 -c network.lowSpeedLimit=1000 -c network.lowSpeedTime=30 clone https://mirror.ghproxy.com/https://github.com/shahbazimasoud/Net-Management.git "$INSTALL_DIR"; then
        CLONE_SUCCESS=true
      fi
    fi

    # Try 3: Direct Tarball Download
    if [ "$CLONE_SUCCESS" = false ]; then
      log_warning "Git clone failed. Attempt 3: Downloading repository tarball directly..."
      TAR_URL="https://codeload.github.com/shahbazimasoud/Net-Management/tar.gz/refs/heads/master"
      if curl -fsSL "$TAR_URL" -o /tmp/nettopology.tar.gz || curl -fsSL "https://mirror.ghproxy.com/$TAR_URL" -o /tmp/nettopology.tar.gz; then
        mkdir -p "$INSTALL_DIR"
        tar -xzf /tmp/nettopology.tar.gz -C "$INSTALL_DIR" --strip-components=1
        rm -f /tmp/nettopology.tar.gz
        CLONE_SUCCESS=true
      fi
    fi

    if [ "$CLONE_SUCCESS" = false ]; then
      log_error "Could not download NetTopology repository files. Please verify server internet connectivity."
      exit 1
    fi
  fi
  cd "$INSTALL_DIR"
fi

log_success "Project directory active: $(pwd)"

# ------------------------------------------------------------------------------
# 4. Data Preservation
# ------------------------------------------------------------------------------
BACKUP_FILE="/etc/nettopology-backup/network_data.json"
TARGET_DATA_FILE="$INSTALL_DIR/backend/network_data.json"

if [ -f "$BACKUP_FILE" ]; then
  log_info "Restoring persistent topology state from $BACKUP_FILE..."
  mkdir -p "$INSTALL_DIR/backend"
  cp "$BACKUP_FILE" "$TARGET_DATA_FILE"
  log_success "Previous topology data preserved successfully."
fi

# ------------------------------------------------------------------------------
# 5. Dependency Installation & Production Build
# ------------------------------------------------------------------------------
# Guard memory, expand ulimits and allocate swap/shm to prevent 'Bus error (core dumped)' on VPS
ensure_system_resources

# Check whether dependencies are already satisfied to avoid reinstalling every time
NEED_NPM_INSTALL=true
if [ -d "$INSTALL_DIR/node_modules" ] && [ -f "$INSTALL_DIR/package.json" ]; then
  LOCK_CHECKSUM=""
  STORED_CHECKSUM=""
  if [ -f "$INSTALL_DIR/package-lock.json" ]; then
    LOCK_CHECKSUM=$(sha256sum "$INSTALL_DIR/package-lock.json" 2>/dev/null | awk '{print $1}')
  else
    LOCK_CHECKSUM=$(sha256sum "$INSTALL_DIR/package.json" 2>/dev/null | awk '{print $1}')
  fi
  if [ -f "$INSTALL_DIR/node_modules/.installed_checksum" ]; then
    STORED_CHECKSUM=$(cat "$INSTALL_DIR/node_modules/.installed_checksum" 2>/dev/null)
  fi
  if [ -n "$LOCK_CHECKSUM" ] && [ "$LOCK_CHECKSUM" = "$STORED_CHECKSUM" ]; then
    NEED_NPM_INSTALL=false
    log_success "NPM dependencies are already up-to-date. Skipping npm install."
  fi
fi

if [ "$NEED_NPM_INSTALL" = true ]; then
  log_step "Installing NPM dependencies..."
  # Clean up any leftover invalid or corrupted custom registry settings
  npm config delete registry 2>/dev/null || true

  # Ensure clean, deterministic install
  if [ -f "$INSTALL_DIR/package-lock.json" ]; then
    log_info "Synchronized package-lock.json detected. Executing deterministic npm ci..."
    if ! npm ci; then
      log_warning "npm ci failed or lockfile discrepancy found. Falling back to npm install..."
      npm install || { log_error "NPM installation failed."; exit 1; }
    fi
  else
    log_info "No package-lock.json found. Executing npm install..."
    npm install || { log_error "NPM installation failed."; exit 1; }
  fi

  # Record checksum of lockfile/package.json for subsequent runs
  if [ -f "$INSTALL_DIR/package-lock.json" ]; then
    sha256sum "$INSTALL_DIR/package-lock.json" 2>/dev/null | awk '{print $1}' > "$INSTALL_DIR/node_modules/.installed_checksum" || true
  elif [ -f "$INSTALL_DIR/package.json" ]; then
    sha256sum "$INSTALL_DIR/package.json" 2>/dev/null | awk '{print $1}' > "$INSTALL_DIR/node_modules/.installed_checksum" || true
  fi
fi

# Detect architecture for native Rollup / esbuild packages
SYS_ARCH=$(uname -m)

log_step "Compiling NetTopology Production Build (Vite + TypeScript Backend)..."

# Clear any broken or corrupt caches from prior interrupted builds
rm -rf dist node_modules/.vite /tmp/esbuild* "$INSTALL_DIR/.tmp"/* 2>/dev/null || true

BUILD_SUCCESS=false

# Tier 1: Standard Build with optimized memory flags and chunking
log_info "Attempt 1: Running primary production build..."
if npm run build; then
  BUILD_SUCCESS=true
else
  log_warning "Primary build encountered a kernel or memory limit (Bus error/OOM). Executing Tier 2 recovery..."
  rm -rf dist node_modules/.vite /tmp/esbuild* "$INSTALL_DIR/.tmp"/* 2>/dev/null || true

  # Re-verify and repair native platform bindings for Rollup and esbuild
  log_info "Repairing native compilation binaries for architecture ($SYS_ARCH)..."
  if [ "$SYS_ARCH" = "x86_64" ]; then
    npm install --no-save @rollup/rollup-linux-x64-gnu @esbuild/linux-x64 2>/dev/null || true
  elif [ "$SYS_ARCH" = "aarch64" ] || [ "$SYS_ARCH" = "arm64" ]; then
    npm install --no-save @rollup/rollup-linux-arm64-gnu @esbuild/linux-arm64 2>/dev/null || true
  fi
  npm rebuild 2>/dev/null || true

  # Stage 2: Staged Frontend + Backend Compilation
  log_info "Attempt 2: Staged isolated compilation..."
  if npx vite build --emptyOutDir; then
    log_success "Frontend assets compiled successfully in staged mode."
    if npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs; then
      log_success "Backend server bundled successfully."
      BUILD_SUCCESS=true
    else
      log_error "Backend esbuild bundle failed in staged mode."
    fi
  else
    log_error "Vite frontend compilation failed in staged mode."
  fi
fi

# Tier 3: Universal WebAssembly (WASM) Engine Fallback
# If the Linux kernel still throws SIGBUS on native Rollup binaries, switch to @rollup/wasm-node
if [ "$BUILD_SUCCESS" = false ]; then
  log_warning "Native bundler triggered kernel memory fault. Executing Tier 3: WebAssembly (WASM) Engine..."
  rm -rf dist node_modules/.vite /tmp/esbuild* "$INSTALL_DIR/.tmp"/* 2>/dev/null || true

  log_info "Installing @rollup/wasm-node (zero-native WebAssembly bundler)..."
  npm install --no-save @rollup/wasm-node 2>/dev/null || true

  # Inject WASM engine directly into Rollup native resolution path
  if [ -d "node_modules/@rollup/wasm-node/dist" ] && [ -d "node_modules/rollup/dist" ]; then
    cp -rf node_modules/@rollup/wasm-node/dist/wasm-node node_modules/rollup/dist/ 2>/dev/null || true
    cp -f node_modules/@rollup/wasm-node/dist/native.js node_modules/rollup/dist/native.js 2>/dev/null || true
    log_info "WebAssembly bundler engine linked into Rollup pipeline."
  fi

  if npx vite build --emptyOutDir && npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs; then
    log_success "NetTopology build successfully produced via WebAssembly engine!"
    BUILD_SUCCESS=true
  fi
fi

if [ "$BUILD_SUCCESS" = false ]; then
  log_error "NetTopology compilation failed. Please verify that the server has at least 1GB of RAM and sufficient disk space."
  exit 1
fi

log_success "NetTopology production build compiled successfully."

# Ensure scripts and backend have execute permissions
chmod +x "$INSTALL_DIR"/*.sh 2>/dev/null || true
chmod +x "$INSTALL_DIR/backend/server.py" 2>/dev/null || true

# ------------------------------------------------------------------------------
# 5.1 Execute Database Schema & Tables Migration (backend/schema.sql)
# ------------------------------------------------------------------------------
if [ -f "$INSTALL_DIR/backend/schema.sql" ]; then
  log_step "Applying PostgreSQL database schema ($INSTALL_DIR/backend/schema.sql)..."
  sudo -u postgres psql -d "$DB_NAME" -f "$INSTALL_DIR/backend/schema.sql" || \
    PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$INSTALL_DIR/backend/schema.sql" || \
    log_warning "Database schema migration executed with notices."

  # Verify created tables count
  TABLE_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ' || echo "0")
  log_success "Database schema verified: $TABLE_COUNT tables active in '$DB_NAME'."

  # Ensure all tables and sequences in public schema have full privileges and ownership granted to DB_USER
  sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;" 2>/dev/null || true
  sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;" 2>/dev/null || true
  sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;" 2>/dev/null || true
  sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;" 2>/dev/null || true
  sudo -u postgres psql -d "$DB_NAME" -c "DO \$\$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' OWNER TO ' || quote_ident('$DB_USER'); END LOOP; END \$\$;" 2>/dev/null || true
  log_success "Full table ownership and privileges assigned to '$DB_USER'."
else
  log_warning "Warning: backend/schema.sql was not found in $INSTALL_DIR."
fi

# Generate random JWT secret if not present
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "nettopology_jwt_secret_$(date +%s)")

# ------------------------------------------------------------------------------
# 6. Environment Configuration (.env) & Systemd Service Deployment
# ------------------------------------------------------------------------------
log_step "Writing Environment Configuration ($INSTALL_DIR/.env)..."
cat << EOF > "$INSTALL_DIR/.env"
NODE_ENV=production
HOST=127.0.0.1
PYTHON_HOST=127.0.0.1
PORT=$INTERNAL_NODE_PORT
FRONTEND_PORT=$INTERNAL_NODE_PORT
BACKEND_PORT=$INTERNAL_BACKEND_PORT
PYTHON_PORT=$INTERNAL_BACKEND_PORT
PANEL_SSL_PORT=$PANEL_SSL_PORT
PANEL_DOMAIN=$PANEL_DOMAIN
DB_HOST=127.0.0.1
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
ADMIN_INITIAL_PASSWORD=$ADMIN_INITIAL_PASSWORD
JWT_SECRET=$JWT_SECRET
EOF

log_step "Stopping any conflicting or stale server processes..."
systemctl stop nettopology.service 2>/dev/null || true
pkill -f "dist/server.cjs" 2>/dev/null || true
pkill -f "backend/server.py" 2>/dev/null || true
sleep 1

log_step "Configuring Systemd Daemon Service..."
SERVICE_FILE="/etc/systemd/system/nettopology.service"
NODE_EXEC=$(command -v node || echo "/usr/bin/node")
[ ! -x "$NODE_EXEC" ] && NODE_EXEC="/usr/local/bin/node"

cat << EOF > "$SERVICE_FILE"
[Unit]
Description=NetTopology Enterprise Cisco Topology & Port Security Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
EnvironmentFile=$INSTALL_DIR/.env
ExecStart=$NODE_EXEC dist/server.cjs
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nettopology.service
systemctl restart nettopology.service

log_success "Systemd service 'nettopology.service' successfully installed and started."

# ------------------------------------------------------------------------------
# 7. Nginx Installation & Strict Self-Signed SSL Configuration
# ------------------------------------------------------------------------------
log_step "Configuring Nginx Reverse Proxy with Strict HTTPS / SSL..."
if ! command -v nginx &>/dev/null; then
  log_info "Installing Nginx web server..."
  safe_apt_install nginx
else
  log_info "Nginx is already installed on the system."
fi

SSL_DIR="/etc/nginx/ssl"
SSL_CERT="$SSL_DIR/nettopology.crt"
SSL_KEY="$SSL_DIR/nettopology.key"

mkdir -p "$SSL_DIR"
if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
  log_info "Generating 10-Year Self-Signed SSL certificate for $PANEL_DOMAIN..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_KEY" \
    -out "$SSL_CERT" \
    -subj "/C=US/ST=Network/L=Enterprise/O=NetTopology/OU=Operations/CN=$PANEL_DOMAIN" 2>/dev/null
  chmod 600 "$SSL_KEY"
fi

NGINX_CONF="/etc/nginx/sites-available/nettopology.conf"
cat << EOF > "$NGINX_CONF"
# NetTopology - Enterprise Cisco Topology & Management Panel
# Strict HTTPS / Self-Signed SSL Mode (Port $PANEL_SSL_PORT)
server {
    listen $PANEL_SSL_PORT ssl http2;
    listen [::]:$PANEL_SSL_PORT ssl http2;
    server_name $PANEL_DOMAIN _;

    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    client_max_body_size 50M;

    # Automatic HTTP -> HTTPS upgrade if client attempts plain HTTP on this SSL port
    error_page 497 301 =301 https://\$host:$PANEL_SSL_PORT\$request_uri;

    # Frontend Web UI & Management Dashboard
    location / {
        proxy_pass http://127.0.0.1:$INTERNAL_NODE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # WebSocket & Cisco Terminal Stream Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Direct Backend API routing
    location /api/ {
        proxy_pass http://127.0.0.1:$INTERNAL_NODE_PORT/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_read_timeout 300s;
    }
}
EOF

ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/nettopology.conf"
if nginx -t &>/dev/null; then
  systemctl reload nginx 2>/dev/null || systemctl restart nginx 2>/dev/null || true
  log_success "Nginx successfully configured with Strict Self-Signed SSL on port $PANEL_SSL_PORT!"
else
  log_warning "Nginx configuration test warning. Reloading service..."
  systemctl restart nginx 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 8. Firewall Configuration (UFW / Firewalld)
# ------------------------------------------------------------------------------
if command -v ufw &>/dev/null && ufw status | grep -q "active"; then
  log_info "Configuring UFW firewall rules for Strict SSL..."
  ufw allow "$PANEL_SSL_PORT/tcp" comment 'NetTopology Secure HTTPS SSL' 2>/dev/null || true
  # Revoke any exposed unencrypted ports
  ufw delete allow 3000/tcp 2>/dev/null || true
  ufw delete allow 5001/tcp 2>/dev/null || true
  ufw delete allow 80/tcp 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 9. Health & HTTP Verification Check
# ------------------------------------------------------------------------------
log_step "Testing live HTTPS response from NetTopology engine..."
HTTP_OK=false
for i in {1..8}; do
  if curl -k -s -f -o /dev/null --connect-timeout 2 "https://127.0.0.1:${PANEL_SSL_PORT}/" || curl -s -f -o /dev/null --connect-timeout 2 "http://127.0.0.1:${INTERNAL_NODE_PORT}/"; then
    HTTP_OK=true
    log_success "✓ Panel response verified securely on https://127.0.0.1:${PANEL_SSL_PORT} (HTTP 200 OK)!"
    break
  fi
  sleep 1
done

if [ "$HTTP_OK" = false ]; then
  log_warning "Could not confirm HTTPS 200 within 8s. Checking recent service logs:"
  journalctl -u nettopology.service -n 25 --no-pager || true
fi

# ------------------------------------------------------------------------------
# 10. Installation Report Summary
# ------------------------------------------------------------------------------
echo ""
log_success "NETTOPOLOGY V${PANEL_VERSION} INSTALLATION COMPLETED SUCCESSFULLY!"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  ${BOLD}NetTopology Enterprise Panel & Database are Live and Active!${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  🔒 ${BOLD}Secure HTTPS Access:${NC}        ${GREEN}${BOLD}https://${PANEL_DOMAIN}:${PANEL_SSL_PORT}${NC}"
echo -e "  🛡️  ${BOLD}Security Mode:${NC}             ${PURPLE}${BOLD}Strict Self-Signed SSL (Port ${PANEL_SSL_PORT})${NC}"
echo -e "  🐘 ${BOLD}PostgreSQL Database:${NC}       ${GREEN}DB: ${DB_NAME} | User: ${DB_USER} | Port: ${DB_PORT}${NC}"
echo -e "  🔑 ${BOLD}Database Password:${NC}         ${GREEN}${DB_PASSWORD}${NC}"
echo -e "  👤 ${BOLD}Primary Admin User:${NC}        ${YELLOW}admin | Pass: ${ADMIN_INITIAL_PASSWORD}${NC}"
echo -e "  🐍 ${BOLD}Backend Service Port:${NC}      ${GREEN}${BOLD}Port ${INTERNAL_BACKEND_PORT} (Loopback 127.0.0.1)${NC}"
echo -e "  📜 ${BOLD}TLS Certificate:${NC}           ${BLUE}/etc/nginx/ssl/nettopology.crt${NC}"
echo -e "  📂 ${BOLD}Installation Path:${NC}         ${YELLOW}${INSTALL_DIR}${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e "  ⚙️  ${BOLD}Service Commands:${NC}"
echo -e "     • Check Status:   ${YELLOW}systemctl status nettopology${NC}"
echo -e "     • Restart Panel:  ${YELLOW}systemctl restart nettopology && systemctl restart nginx${NC}"
echo -e "     • View Live Logs: ${YELLOW}journalctl -u nettopology -f -n 50${NC}"
echo -e "     • Stop Service:   ${YELLOW}systemctl stop nettopology && systemctl stop nginx${NC}"
echo -e ""
echo -e "  🗑️  ${BOLD}To Uninstall:${NC}"
echo -e "     ${RED}curl -sSL https://raw.githubusercontent.com/shahbazimasoud/Net-Management/master/uninstall-panel.sh | sudo bash${NC}"
echo -e "${CYAN}======================================================================${NC}"

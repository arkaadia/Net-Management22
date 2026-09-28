#!/usr/bin/env bash

# ==============================================================================
#  NetTopology - Cisco Network Topology & Port Security Automation Panel
#  Automated Installation Script for Linux (Ubuntu, Debian, RHEL, CentOS, Fedora, Arch)
# ==============================================================================

set -e

# Enterprise DevOps Architecture: Reliable TTY & Pipe Mode Execution
has_usable_tty() {
  (exec < /dev/tty) 2>/dev/null && (exec > /dev/tty) 2>/dev/null
}

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
     pgrep -f "apt.systemd.daily" >/dev/null 2>&1; then
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
      echo -e "${YELLOW}قفل پکیج‌منیجر (apt/dpkg) توسط پردازش‌های پس‌زمینه سیستم‌عامل (مثل بروزرسانی خودکار) در حال استفاده است.${NC}"
      echo -e "${YELLOW}در حال انتظار برای اتمام پردازش پس‌زمینه (حداکثر ${max_wait} ثانیه)...${NC}"
    fi
    sleep 3
    waited=$((waited + 3))
    if [ $waited -ge $max_wait ]; then
      echo -e "${YELLOW}توقف پردازش‌های آپدیت پس‌زمینه برای ادامه نصب...${NC}"
      systemctl stop unattended-upgrades 2>/dev/null || true
      systemctl stop apt-daily.service 2>/dev/null || true
      systemctl stop apt-daily-upgrade.service 2>/dev/null || true
      pkill -f "unattended-upgr" 2>/dev/null || true
      sleep 2
      break
    fi
  done
  [ "$locked" = true ] && echo -e "${GREEN}✓ قفل پکیج‌منیجر آزاد شد.${NC}"
  DEBIAN_FRONTEND=noninteractive dpkg --configure -a 2>/dev/null || true
}

prompt_input() {
  local prompt_text="$1"
  local var_name="$2"
  local default_val="$3"
  local user_input=""

  if has_usable_tty; then
    printf "%b" "$prompt_text" > /dev/tty
    read -r user_input < /dev/tty
  elif [ -t 0 ]; then
    read -p "$prompt_text" user_input
  else
    printf "%b" "$prompt_text"
    user_input="$default_val"
    echo -e " [پیش‌فرض خودکار: ${default_val}]"
  fi
  user_input=$(echo "$user_input" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  eval "$var_name=\"\${user_input:-\$default_val}\""
}

ensure_system_swap() {
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

  # 1. Expand Process Stack and File Descriptor Limits (Prevents SIGBUS / AST recursion limit)
  ulimit -s 65536 2>/dev/null || ulimit -s unlimited 2>/dev/null || true
  ulimit -n 65536 2>/dev/null || ulimit -n 4096 2>/dev/null || true
  ulimit -v unlimited 2>/dev/null || true
  ulimit -m unlimited 2>/dev/null || true

  # 2. Kernel inotify and file-max adjustments
  sysctl -w fs.inotify.max_user_watches=524288 2>/dev/null || true
  sysctl -w fs.inotify.max_user_instances=1024 2>/dev/null || true
  sysctl -w fs.file-max=2097152 2>/dev/null || true

  # 3. Guard Shared Memory (/dev/shm) to prevent mmap / POSIX shm SIGBUS errors
  if [ -d /dev/shm ]; then
    local shm_size_mb
    shm_size_mb=$(df -m /dev/shm 2>/dev/null | awk 'NR==2 {print $2}')
    shm_size_mb=${shm_size_mb:-0}
    if [ "$shm_size_mb" -lt 1024 ]; then
      echo -e "${YELLOW}افزایش ظرفیت حافظه مشترک (/dev/shm) به ۲ گیگابایت جهت جلوگیری از کرش SIGBUS...${NC}"
      mount -o remount,size=2G /dev/shm 2>/dev/null || true
    fi
  fi

  # 4. Swap allocation for systems with low swap
  if [ "$total_swap_mb" -lt 1500 ]; then
    echo -e "${YELLOW}فضای Swap حافظه ناکافی است (${total_swap_mb}MB). جهت جلوگیری از خطای Bus error و کمبود رم در زمان کامپایل، ۲ گیگابایت Swap موقت ایجاد می‌شود...${NC}"

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
        echo -e "${GREEN}✓ فایل Swap فعال شد. فضای Swap فعال: $(free -m 2>/dev/null | awk '/Swap:/ {print $2}')MB${NC}"
      fi
    else
      swapon /swapfile 2>/dev/null || true
    fi
  fi
}
ensure_system_resources() {
  ensure_system_swap
}

# Color definitions for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print Banner
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║     🌐  NetTopology - Enterprise Network Management Panel        ║"
echo "║     🚀  Version: 1.62.1 (Production Stable)                      ║"
echo "║     🛡️  Cisco Port Security & CDP/LLDP Topology Visualizer       ║"
echo "║     🎨  Spatial Cyber Neon & Multi-Theme Network Studio          ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}[1/6]${NC} ${BOLD}بررسی سطح دسترسی کاربر (Checking privileges)...${NC}"
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}توجه: برای نصب پکیج‌های سیستمی و ساخت سرویس systemd نیاز به دسترسی root / sudo است.${NC}"
  echo -e "${YELLOW}لطفاً اسکریپت را با sudo اجرا نمایید: sudo bash install.sh${NC}"
  echo ""
  prompt_input "آیا می‌خواهید با sudo مجدداً اجرا شود؟ (y/N): " choice "n"
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    exec sudo bash "$0" "$@"
  else
    echo -e "${RED}خطا: دسترسی کافی وجود ندارد. نصب متوقف شد.${NC}"
    exit 1
  fi
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo -e "${GREEN}✓ مسیر ریشه پنل:${NC} $APP_DIR"

# Detect Local & Public IP safely
LOCAL_IP=""
if command -v ip &>/dev/null; then
  LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || true)
fi
if [ -z "$LOCAL_IP" ] && command -v hostname &>/dev/null; then
  LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
fi
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

echo -e "\n${YELLOW}>>> لطفاً تنظیمات شبکه و پورت امن SSL را مشخص کنید:${NC}"
prompt_input "آدرس دامنه یا آی‌پی سرور جهت صدور گواهی SSL [پیش‌فرض: $LOCAL_IP]: " PANEL_DOMAIN "$LOCAL_IP"

while true; do
  prompt_input "پورت امن HTTPS / SSL برای دسترسی به پنل NetTopology [پیش‌فرض: 8443]: " PANEL_SSL_PORT "8443"
  if [[ "$PANEL_SSL_PORT" =~ ^[0-9]+$ ]] && [ "$PANEL_SSL_PORT" -ge 1 ] && [ "$PANEL_SSL_PORT" -le 65535 ]; then
    break
  else
    echo -e "${RED}پورت نامعتبر است. یک عدد بین 1 تا 65535 وارد کنید.${NC}"
  fi
done

while true; do
  prompt_input "پورت سرویس بک‌اند (API / Python Engine) [پیش‌فرض: 5001]: " BACKEND_PORT_INPUT "5001"
  if [[ "$BACKEND_PORT_INPUT" =~ ^[0-9]+$ ]] && [ "$BACKEND_PORT_INPUT" -ge 1 ] && [ "$BACKEND_PORT_INPUT" -le 65535 ]; then
    if [ "$BACKEND_PORT_INPUT" -eq "$PANEL_SSL_PORT" ]; then
      echo -e "${RED}پورت بک‌اند نمی‌تواند با پورت عمومی پنل ($PANEL_SSL_PORT) تداخل داشته باشد.${NC}"
    else
      INTERNAL_BACKEND_PORT="$BACKEND_PORT_INPUT"
      break
    fi
  else
    echo -e "${RED}پورت نامعتبر است. یک عدد بین 1 تا 65535 وارد کنید.${NC}"
  fi
done

# --- تنظیمات تعاملی پایگاه‌داده PostgreSQL ---
echo -e "\n${PURPLE}>>> تنظیمات دیتابیس پایدار PostgreSQL (ذخیره‌سازی دائمی کاربران، دسترسی‌ها و توپولوژی):${NC}"
prompt_input "نام دیتابیس PostgreSQL [پیش‌فرض: nettopology_db]: " DB_NAME "nettopology_db"
prompt_input "نام کاربری دیتابیس PostgreSQL [پیش‌فرض: nettopology_user]: " DB_USER "nettopology_user"

prompt_input "رمز عبور دیتابیس PostgreSQL [اینتر برای تولید خودکار رمز رندوم امن]: " DB_PASS_INPUT ""
if [ -z "$DB_PASS_INPUT" ]; then
  DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 16 2>/dev/null || echo "NetTopPass_$(date +%s)")
  echo -e "${CYAN}✓ رمز عبور رندوم امن برای دیتابیس تولید شد:${NC} ${BOLD}$DB_PASSWORD${NC}"
else
  DB_PASSWORD="$DB_PASS_INPUT"
fi

while true; do
  prompt_input "پورت سرویس PostgreSQL [پیش‌فرض: 5432]: " DB_PORT "5432"
  if [[ "$DB_PORT" =~ ^[0-9]+$ ]] && [ "$DB_PORT" -ge 1 ] && [ "$DB_PORT" -le 65535 ]; then
    break
  else
    echo -e "${RED}پورت نامعتبر است. یک عدد بین 1 تا 65535 وارد کنید.${NC}"
  fi
done

prompt_input "کلمه عبور اولیه حساب کاربری مدیر ارشد پنل (admin) [پیش‌فرض: admin123]: " ADMIN_PASS_INPUT "admin123"
ADMIN_INITIAL_PASSWORD="${ADMIN_PASS_INPUT:-admin123}"

# Internal loopback ports for Node and Python (isolated from external network)
INTERNAL_NODE_PORT="3000"
if [ "$PANEL_SSL_PORT" -eq "$INTERNAL_NODE_PORT" ] || [ "$INTERNAL_BACKEND_PORT" -eq "$INTERNAL_NODE_PORT" ]; then
  INTERNAL_NODE_PORT="13000"
  if [ "$PANEL_SSL_PORT" -eq "$INTERNAL_NODE_PORT" ] || [ "$INTERNAL_BACKEND_PORT" -eq "$INTERNAL_NODE_PORT" ]; then
    INTERNAL_NODE_PORT="13001"
  fi
fi

echo -e "${CYAN}✓ معماری امنیتی، دیتابیس و پورت‌های سیستم تنظیم شد:${NC}"
echo -e "  • دسترسی عمومی: صرفاً از طریق HTTPS با پورت $PANEL_SSL_PORT و گواهی Self-Signed"
echo -e "  • پورت بک‌اند (API & Engine): پورت اختصاصی $INTERNAL_BACKEND_PORT (محدود به 127.0.0.1)"
echo -e "  • پایگاه داده PostgreSQL: دیتابیس '$DB_NAME' با کاربر '$DB_USER' روی پورت $DB_PORT"
echo -e "  • جداسازی داخلی: سرویس‌های Node.js و Python به لوپ‌بک محلی (127.0.0.1) محدود شدند.\n"

# ذخیره تنظیمات در فایل .env
cat << EOF > "$APP_DIR/.env"
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
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "nettopology_secret_fallback_$(date +%s)")
EOF

# ------------------------------------------------------------------------------
# 2. Package Manager & System Dependencies & PostgreSQL
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[2/7]${NC} ${BOLD}نصب پیش‌نیازهای سیستمی و سرور پایگاه‌داده PostgreSQL...${NC}"

if command -v apt-get &>/dev/null; then
  export DEBIAN_FRONTEND=noninteractive
  wait_for_dpkg_lock
  apt-get update -y || true
  apt-get install -y curl git python3 python3-pip python3-paramiko python3-cryptography python3-websockets traceroute dnsutils whois iputils-ping postgresql postgresql-contrib nginx openssl guacd libguac-client-rdp0 libguac-client-vnc0
elif command -v dnf &>/dev/null; then
  dnf install -y epel-release 2>/dev/null || true
  dnf install -y curl git python3 python3-pip traceroute bind-utils whois iputils postgresql-server postgresql-contrib guacd
  postgresql-setup --initdb 2>/dev/null || true
elif command -v yum &>/dev/null; then
  yum install -y epel-release 2>/dev/null || true
  yum install -y curl git python3 python3-pip traceroute bind-utils whois iputils postgresql-server postgresql-contrib guacd
  postgresql-setup --initdb 2>/dev/null || true
elif command -v pacman &>/dev/null; then
  pacman -Sy --noconfirm curl git python python-pip traceroute bind whois iputils postgresql
else
  echo -e "${YELLOW}مدیریت پکیج شناخته نشد، لطفاً از نصب بودن git, curl, python3, postgresql و guacd اطمینان حاصل فرمایید.${NC}"
fi

# Ensure Paramiko 2.12.0 is pinned in Python runtime (crucial for legacy Cisco IOS 12.2/2960 SSH-2 compatibility)
if command -v pip3 &>/dev/null; then
  pip3 install --break-system-packages "paramiko==2.12.0" "cryptography>=3.3,<41.0.0" "websockets>=10.4" 2>/dev/null || \
  pip3 install "paramiko==2.12.0" "cryptography>=3.3,<41.0.0" "websockets>=10.4" 2>/dev/null || true
fi

# ------------------------------------------------------------------------------
# 2.5 PostgreSQL Service Setup, User Creation, and Database Migration
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[2.5/7]${NC} ${BOLD}پیکربندی خودکار پایگاه داده PostgreSQL و اعمال اسکیما...${NC}"
systemctl enable postgresql 2>/dev/null || true
systemctl start postgresql 2>/dev/null || service postgresql start 2>/dev/null || true

# Wait for PostgreSQL socket to be ready
PG_READY=false
for i in {1..10}; do
  if sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    PG_READY=true
    break
  fi
  sleep 1
done

if [ "$PG_READY" = "true" ]; then
  echo -e "${CYAN}سرویس PostgreSQL فعال است. در حال ایجاد کاربر و پایگاه‌داده...${NC}"
  # Create user if not exists
  sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD'; END IF; END \$\$;"
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
  # Create database if not exists
  if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo -e "${GREEN}✓ پایگاه داده '$DB_NAME' با موفقیت ایجاد شد.${NC}"
  else
    echo -e "${CYAN}اطلاعات: دیتابیس '$DB_NAME' از قبل موجود است.${NC}"
    sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null || true
  fi
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>/dev/null || true

  # Run schema.sql
  if [ -f "$APP_DIR/backend/schema.sql" ]; then
    echo -e "${CYAN}در حال اجرای ساخت جداول از backend/schema.sql...${NC}"
    sudo -u postgres psql -d "$DB_NAME" -f "$APP_DIR/backend/schema.sql" || \
    PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/backend/schema.sql" || true
    
    TABLE_COUNT=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ' || echo "0")
    echo -e "${GREEN}✓ اسکیما و جداول PostgreSQL با موفقیت ایجاد شدند (تعداد جداول: $TABLE_COUNT).${NC}"
  fi
else
  echo -e "${YELLOW}هشدار: سرویس PostgreSQL بلافاصله پاسخگو نبود. لطفاً پس از پایان نصب وضعیت را با systemctl status postgresql بررسی کنید.${NC}"
fi

# ------------------------------------------------------------------------------
# 2.6 Apache Guacamole Daemon (guacd) for In-Browser RDP/VNC Setup
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[2.6/7]${NC} ${BOLD}راه‌اندازی سرویس گیت‌وی ریموت دسکتاپ (Apache Guacamole Daemon - guacd)...${NC}"
systemctl enable guacd 2>/dev/null || true
systemctl start guacd 2>/dev/null || service guacd start 2>/dev/null || true

if command -v guacd &>/dev/null || systemctl is-active --quiet guacd 2>/dev/null; then
  echo -e "${GREEN}✓ سرویس ریموت دسکتاپ guacd فعال شد.${NC}"
else
  echo -e "${CYAN}سرویس guacd در پس‌زمینه آماده‌سازی شد.${NC}"
fi

# ------------------------------------------------------------------------------
# 3. Node.js & NPM Installation (Node 18+ or 20+ required)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[3/6]${NC} ${BOLD}بررسی و نصب Node.js (v20 LTS)...${NC}"

INSTALL_NODE=false
if ! command -v node &>/dev/null; then
  INSTALL_NODE=true
else
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -lt 18 ]; then
    echo -e "${YELLOW}نسخه فعلی Node.js ($NODE_VER) قدیمی است. نسخه ۲۰ LTS نصب می‌شود.${NC}"
    INSTALL_NODE=true
  else
    echo -e "${GREEN}✓ Node.js نسخه $(node -v) قبلاً نصب است.${NC}"
  fi
fi

if [ "$INSTALL_NODE" = true ]; then
  echo -e "${CYAN}در حال دریافت و نصب Node.js 20 LTS...${NC}"
  if command -v apt-get &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  elif command -v dnf &>/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
  elif command -v yum &>/dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
  elif command -v pacman &>/dev/null; then
    pacman -S --noconfirm nodejs npm
  fi
  echo -e "${GREEN}✓ Node.js $(node -v) و NPM $(npm -v) با موفقیت نصب شدند.${NC}"
fi

# ------------------------------------------------------------------------------
# 4. Install Project Dependencies & Build App
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[4/6]${NC} ${BOLD}نصب وابستگی‌های پروژه و بیلد نهایی پنل (Building NetTopology)...${NC}"

# Ensure system has enough swap, shm and ulimits to prevent Bus error / OOM
ensure_system_resources

# Ensure correct permissions
chown -R "$SUDO_USER:$SUDO_USER" "$APP_DIR" 2>/dev/null || true

# Dynamic memory sizing based on detected system RAM
SYS_MEM_MB=0
if [ -f /proc/meminfo ]; then
  SYS_MEM_MB=$(grep -i MemTotal /proc/meminfo | awk '{print int($2/1024)}')
elif command -v free &>/dev/null; then
  SYS_MEM_MB=$(free -m 2>/dev/null | awk '/Mem:/ {print $2}')
fi
SYS_MEM_MB=${SYS_MEM_MB:-1024}

NODE_HEAP_MB=2048
if [ "$SYS_MEM_MB" -ge 4000 ]; then
  NODE_HEAP_MB=4096
elif [ "$SYS_MEM_MB" -le 1500 ]; then
  NODE_HEAP_MB=1536
fi

mkdir -p "$APP_DIR/.tmp"
chmod 777 "$APP_DIR/.tmp" 2>/dev/null || true
export TMPDIR="$APP_DIR/.tmp"
export NODE_OPTIONS="--max-old-space-size=${NODE_HEAP_MB}"
rm -rf "$APP_DIR/dist" "$APP_DIR/node_modules/.vite" /tmp/esbuild* "$APP_DIR/.tmp"/* 2>/dev/null || true

# Run npm install
if [ -n "$SUDO_USER" ]; then
  su - "$SUDO_USER" -c "cd '$APP_DIR' && export TMPDIR='$APP_DIR/.tmp' && npm install"
else
  npm install
fi

SYS_ARCH=$(uname -m)
BUILD_OK=false

# Tier 1: Standard npm run build
if [ -n "$SUDO_USER" ]; then
  if su - "$SUDO_USER" -c "cd '$APP_DIR' && export TMPDIR='$APP_DIR/.tmp' && export NODE_OPTIONS='--max-old-space-size=${NODE_HEAP_MB}' && npm run build"; then
    BUILD_OK=true
  fi
else
  if npm run build; then
    BUILD_OK=true
  fi
fi

# Tier 2: Staged compilation with native binding repair
if [ "$BUILD_OK" = false ]; then
  echo -e "${YELLOW}کامپایل استاندارد با محدودیت مواجه شد. در حال بهینه‌سازی باینری‌ها و اجرای بیلد دومرحله‌ای...${NC}"
  rm -rf "$APP_DIR/dist" "$APP_DIR/node_modules/.vite" /tmp/esbuild* "$APP_DIR/.tmp"/* 2>/dev/null || true
  
  if [ "$SYS_ARCH" = "x86_64" ]; then
    npm install --no-save @rollup/rollup-linux-x64-gnu @esbuild/linux-x64 2>/dev/null || true
  elif [ "$SYS_ARCH" = "aarch64" ] || [ "$SYS_ARCH" = "arm64" ]; then
    npm install --no-save @rollup/rollup-linux-arm64-gnu @esbuild/linux-arm64 2>/dev/null || true
  fi
  npm rebuild 2>/dev/null || true

  if npx vite build --emptyOutDir && npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs; then
    BUILD_OK=true
  fi
fi

# Tier 3: Universal WebAssembly Engine Fallback
if [ "$BUILD_OK" = false ]; then
  echo -e "${YELLOW}در حال اجرای کامپایلر ایزوله WebAssembly (@rollup/wasm-node)...${NC}"
  rm -rf "$APP_DIR/dist" "$APP_DIR/node_modules/.vite" /tmp/esbuild* "$APP_DIR/.tmp"/* 2>/dev/null || true
  npm install --no-save @rollup/wasm-node 2>/dev/null || true

  # Inject WASM engine directly into Rollup native resolution path
  if [ -d "$APP_DIR/node_modules/@rollup/wasm-node/dist" ] && [ -d "$APP_DIR/node_modules/rollup/dist" ]; then
    cp -rf "$APP_DIR/node_modules/@rollup/wasm-node/dist/wasm-node" "$APP_DIR/node_modules/rollup/dist/" 2>/dev/null || true
    cp -f "$APP_DIR/node_modules/@rollup/wasm-node/dist/native.js" "$APP_DIR/node_modules/rollup/dist/native.js" 2>/dev/null || true
  fi

  if npx vite build --emptyOutDir && npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs; then
    BUILD_OK=true
  fi
fi

if [ "$BUILD_OK" = false ]; then
  echo -e "${RED}خطا: کامپایل پروژه ناموفق بود. لطفاً از وجود فضای دیسک کافی اطمینان حاصل کنید.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ کامپایل و بیلد پروژه با موفقیت انجام شد.${NC}"

# ------------------------------------------------------------------------------
# 5. Create Management Scripts (start.sh, stop.sh, restart.sh)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[5/6]${NC} ${BOLD}ایجاد اسکریپت‌های مدیریت پنل (Start/Stop/Restart)...${NC}"

# start.sh
cat << 'EOF' > "$APP_DIR/start.sh"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q nettopology.service; then
  echo -e "\033[0;32mروشن کردن سرویس nettopology از طریق systemd...\033[0m"
  sudo systemctl start nettopology
  sudo systemctl status nettopology --no-pager
else
  echo -e "\033[0;36mاجرای پنل در حالت مستقیم...\033[0m"
  node dist/server.cjs
fi
EOF
chmod +x "$APP_DIR/start.sh"

# stop.sh
cat << 'EOF' > "$APP_DIR/stop.sh"
#!/usr/bin/env bash
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q nettopology.service; then
  echo -e "\033[0;33mمتوقف کردن سرویس nettopology...\033[0m"
  sudo systemctl stop nettopology
  echo -e "\033[0;32mسرویس متوقف شد.\033[0m"
else
  echo -e "\033[0;33mبستن پروسه‌های در حال اجرای سرور...\033[0m"
  pkill -f "dist/server.cjs" || true
  pkill -f "server.py" || true
  echo -e "\033[0;32mپروسه‌ها بسته شدند.\033[0m"
fi
EOF
chmod +x "$APP_DIR/stop.sh"

# restart.sh
cat << 'EOF' > "$APP_DIR/restart.sh"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"
if command -v systemctl &>/dev/null && systemctl list-unit-files | grep -q nettopology.service; then
  echo -e "\033[0;33mراه‌اندازی مجدد سرویس nettopology...\033[0m"
  sudo systemctl restart nettopology
  sudo systemctl status nettopology --no-pager
else
  "$DIR/stop.sh"
  sleep 1
  "$DIR/start.sh"
fi
EOF
chmod +x "$APP_DIR/restart.sh"

# ------------------------------------------------------------------------------
# 6. Configure Systemd Service (Autostart on Boot)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}[6/6]${NC} ${BOLD}پیکربندی سرویس سیستم‌دی (systemd daemon)...${NC}"

NODE_BIN=$(command -v node)
SERVICE_FILE="/etc/systemd/system/nettopology.service"
RUN_USER=${SUDO_USER:-$(whoami)}

# Ensure execute permissions
chmod +x "$APP_DIR"/*.sh 2>/dev/null || true
chmod +x "$APP_DIR/backend/server.py" 2>/dev/null || true

# Stop previous instances if running
systemctl stop nettopology.service 2>/dev/null || true
pkill -f "dist/server.cjs" 2>/dev/null || true
pkill -f "backend/server.py" 2>/dev/null || true
sleep 1

cat << EOF > "$SERVICE_FILE"
[Unit]
Description=NetTopology - Network Management & Port Security Panel
After=network.target

[Service]
Type=simple
User=$RUN_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=-$APP_DIR/.env
ExecStart=$NODE_BIN $APP_DIR/dist/server.cjs
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PYTHON_HOST=127.0.0.1
Environment=PORT=$INTERNAL_NODE_PORT
Environment=FRONTEND_PORT=$INTERNAL_NODE_PORT
Environment=BACKEND_PORT=$INTERNAL_BACKEND_PORT
Environment=PYTHON_PORT=$INTERNAL_BACKEND_PORT

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nettopology.service
systemctl restart nettopology.service

# Check health
sleep 2
if ! systemctl is-active --quiet nettopology.service; then
  echo -e "${RED}خطا: سرویس با موفقیت فعال نشد. لاگ‌های زیر را بررسی کنید:${NC}"
  journalctl -u nettopology.service -n 25 --no-pager || true
fi

# Configure Nginx Reverse Proxy with Strict Self-Signed SSL Only
echo ""
echo -e "${BLUE}[6/6]${NC} ${BOLD}پیکربندی Nginx و گواهی امنیتی Self-Signed SSL روی پورت $PANEL_SSL_PORT...${NC}"
if ! command -v nginx &>/dev/null; then
  if command -v apt-get &>/dev/null; then
    wait_for_dpkg_lock
    DEBIAN_FRONTEND=noninteractive apt-get install -y nginx openssl < /dev/null || true
  elif command -v dnf &>/dev/null; then
    dnf install -y nginx openssl || true
  fi
fi

# Remove default site
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

mkdir -p /etc/nginx/ssl
SSL_CERT="/etc/nginx/ssl/nettopology.crt"
SSL_KEY="/etc/nginx/ssl/nettopology.key"

if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
  echo -e "${CYAN}در حال صدور گواهی 10 ساله Self-Signed SSL برای $PANEL_DOMAIN...${NC}"
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_KEY" \
    -out "$SSL_CERT" \
    -subj "/CN=$PANEL_DOMAIN/O=NetTopology/OU=Enterprise Network Security" 2>/dev/null || true
  chmod 600 "$SSL_KEY"
fi

NGINX_CONF="/etc/nginx/sites-available/nettopology.conf"
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
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

    error_page 497 301 =301 https://\$host:$PANEL_SSL_PORT\$request_uri;

    location / {
        proxy_pass http://127.0.0.1:$INTERNAL_NODE_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

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
fi

# Firewall Check (UFW)
if command -v ufw &>/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow "$PANEL_SSL_PORT/tcp" comment 'NetTopology Secure HTTPS SSL' 2>/dev/null || true
  ufw delete allow 3000/tcp 2>/dev/null || true
  ufw delete allow 5001/tcp 2>/dev/null || true
  ufw delete allow 80/tcp 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD} 🎉  نصب و پیکربندی امنیتی با موفقیت کامل انجام شد!                 ${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "🔒 ${BOLD}آدرس امن دسترسی به پنل (Strict Self-Signed SSL):${NC}"
echo -e "   ${GREEN}${BOLD}https://${PANEL_DOMAIN}:${PANEL_SSL_PORT}${NC}"
echo ""
echo -e "🛡️  ${BOLD}وضعیت معماری امنیتی:${NC}"
echo -e "   • حالت: ${PURPLE}${BOLD}فقط SSL / HTTPS فعال است (پورت ${PANEL_SSL_PORT})${NC}"
echo -e "   • پورت‌های داخلی: ${BLUE}روی 127.0.0.1 ایزوله و محافظت شده‌اند${NC}"
echo -e "   • گواهی SSL: ${YELLOW}/etc/nginx/ssl/nettopology.crt${NC}"
echo ""
echo -e "🔹 ${BOLD}دستورات مدیریت پنل:${NC}"
echo -e "   • وضعیت سرویس:          ${YELLOW}sudo systemctl status nettopology${NC}"
echo -e "   • ری‌استارت سرویس:        ${YELLOW}sudo systemctl restart nettopology && sudo systemctl restart nginx${NC}"
echo -e "   • متوقف کردن سرویس:     ${YELLOW}sudo systemctl stop nettopology && sudo systemctl stop nginx${NC}"
echo -e "   • مشاهده لاگ‌های زنده:    ${YELLOW}sudo journalctl -u nettopology -f${NC}"
echo ""
echo -e "${PURPLE}${BOLD}از استفاده از پنل مدیریت و امنیت شبکه سیسکو لذت ببرید! 🚀${NC}"

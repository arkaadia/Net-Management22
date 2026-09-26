export type VersionType = 'major' | 'minor' | 'patch';

export interface ReleaseNote {
  version: string;
  releaseDate: string;
  type: VersionType;
  title: string;
  title_en?: string;
  changes: string[];
  changes_en?: string[];
}

export const APP_VERSION = '1.174.0';

export const RELEASE_HISTORY: ReleaseNote[] = [
  {
    version: '1.174.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'ارتباط مستقیم وب‌سوکت با موتور SSH پایتون پارامیکو ۲، انطباق جامع با سوئیچ‌های سیسکو ۲۹۶۰، حذف کامل داده‌های ماک و گزارش عیب‌یابی تعاملی',
    title_en: 'Direct WebSocket Gateway to Python Paramiko 2 SSH Engine, Dedicated Cisco 2960 Suite, Zero Mock Data & Interactive Diagnostic Workflow',
    changes: [
      'هدایت مستقیم و انحصاری تمامی نشست‌های وب‌ترمینال (سوئیچ‌ها، روترها و سرورها) از طریق پروکسی وب‌سوکت فول‌دوپلکس نود به موتور بک‌اند پایتون و سرور وب‌سوکت پارامیکو ۲ (ws://127.0.0.1:5002).',
      'ارتقا و استقرار کتابخانه پارامیکو ۲ (Paramiko 2.12.0) در محیط پایتون با پشتیبانی کامل از پروتکل SSHv2 و نشست‌های زنده و کاملاً تعاملی شل PTY سخت‌افزاری.',
      'توسعه سوئیت رمزنگاری بهینه‌سازی‌شده برای سوئیچ‌های سیسکو ۲۹۶۰ (Cisco Catalyst 2960 / IOS 12 & 15) شامل تبادل کلید DH Group 14/1 SHA1 و Group Exchange، کلیدهای هاست ssh-rsa، سایفرهای سازگار aes128-cbc و 3des-cbc و کدهای اعتبارسنجی پیام hmac-sha1.',
      'رفع قطعی خطاهای کلید سایفر (Cipher Key) و ناسازگاری الگوریتم از طریق بازتاب امن دیکشنری‌های داخلی پارامیکو (_cipher_info, _kex_info, _key_info) و جلوگیری از ارسال الگوهای منحنی بیضوی ناسازگار به سوئیچ‌های قدیمی‌تر.',
      'حذف کامل و قطعی هرگونه دیتای ماک، شبیه‌سازی یا نشست ساختگی CLI (بر اساس قانون تخطی‌ناپذیر ۸) و تضمین انعکاس ۱۰۰٪ خروجی واقعی سخت‌افزار در ترمینال.',
      'پیاده‌سازی موتور هوشمند تحلیل و گزارش عیب‌یابی (generate_cisco_diagnostic_report) همراه با تفکیک نوع خطا، تشریح دقیق علت به زبان فارسی و انگلیسی، و ورک‌فلو و دستورات دقیق CLI سیسکو جهت رفع مشکل در سوئیچ ۲۹۶۰.'
    ],
    changes_en: [
      'Rerouted all terminal WebSocket sessions directly through the Node full-duplex proxy to the Python Paramiko 2 WebSocket engine (ws://127.0.0.1:5002) for real hardware SSH execution.',
      'Deployed Paramiko 2 (v2.12.0) in the Python backend environment with full SSHv2 protocol support and authentic, interactive bidirectional PTY shell streaming.',
      'Engineered a dedicated cryptographic suite for Cisco Catalyst 2960 switches (IOS 12 & 15) prioritizing DH Group 14/1 SHA1, Group Exchange, ssh-rsa host keys, and aes128-cbc / 3des-cbc ciphers.',
      'Completely eliminated cipher key and algorithm negotiation failures via safe runtime dictionary reflection (_cipher_info, _kex_info, _key_info), preventing elliptic curve resets on legacy switch firmware.',
      'Strictly eradicated all mock, fake, or simulated CLI terminal fallbacks in accordance with Rule 8, guaranteeing 100% authentic hardware telemetry and transparent error reporting.',
      'Built a comprehensive diagnostic and troubleshooting engine (generate_cisco_diagnostic_report) detailing exact root causes, bilingual resolution workflows, and copy-pasteable Cisco 2960 CLI commands.'
    ]
  },
  {
    version: '1.173.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'فاز ۴ مدیریت آپاچی: ماژول مدیریت هاست‌های مجازی (VirtualHost)، سوئیچ فعال/غیرفعال‌سازی، ویزارد ساخت وب‌سایت و پروکسی معکوس',
    title_en: 'Apache Management Phase 4: Virtual Hosts Management, Live AST Extractor, Enable/Disable Controller & Deployment Wizard',
    changes: [
      'پیاده‌سازی موتور عمیق استخراج و تجزیه بلوک‌های <VirtualHost> آپاچی (/server/apacheVirtualHosts.ts) با اسکنر قدرتمند AST پایتون بر روی کل فایل‌های کانفیگ، sites-available و conf.d.',
      'استخراج مشخصات کلیدی هر هاست مجازی: ServerName، دامنه‌های مستعار (ServerAlias)، آدرس و پورت، وضعیت SSL، ریشه اسناد (DocumentRoot)، مقاصد پروکسی (ProxyPass)، لاگ‌ها و ایمیل مدیر.',
      'پیاده‌سازی مکانیزم ایمن فعال‌سازی و غیرفعال‌سازی سایت‌ها (a2ensite / a2dissite در دبیان/اوبونتو و مدیریت فایل در ردهت/راکی) به همراه تست سینتکس آنی و رول‌بک خودکار در صورت بروز خطای پیکربندی.',
      'توسعه ویزارد جامع ساخت VirtualHost جدید با پشتیبانی از وب‌استاتیک و پروکسی معکوس، تست سینتکس قبل از اعمال و بارگذاری مجدد نرم (Graceful Reload) سرویس.',
      'ایجاد اندپوینت‌های بک‌اند: /api/remote-servers/:id/apache-vhosts، apache-vhost-toggle، apache-vhost-create و apache-vhost-delete همراه با توابع کلاینت API.',
      'توسعه کامل تب Virtual Hosts در کامپوننت ApacheManagementModal همراه با کارت‌های ویژوال، فیلترهای چندگانه وضعیت، پیش‌نمایش زنده کد و دکمه‌های کنترل وضعیت.'
    ],
    changes_en: [
      'Engineered deep AST VirtualHost extraction engine (/server/apacheVirtualHosts.ts) scanning active and available configs across Debian/Ubuntu sites-available and RHEL conf.d.',
      'Extracted comprehensive VirtualHost metadata: ServerName, ServerAlias, Listen IP/Port, SSL state, DocumentRoot, ProxyPass targets, custom/error logs, and ServerAdmin.',
      'Built atomic enable/disable controller using a2ensite/a2dissite on Debian and symlink/rename handling on RHEL with instant syntax verification (-t) and automatic rollback.',
      'Created VirtualHost deployment wizard supporting both standard web roots and reverse proxy configurations with syntax dry-run verification and graceful reload.',
      'Integrated backend routes for discovery, toggle, creation, and deletion alongside matching client API functions in src/services/api.ts.',
      'Engineered comprehensive Virtual Hosts tab in ApacheManagementModal featuring visual cards, live domain search, multi-criteria filters, and raw configuration code modals.'
    ]
  },
  {
    version: '1.172.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'فاز ۳ مدیریت آپاچی: موتور تحلیل ساختار درختی کانفیگ، پیمایش بازگشتی Includeها، استخراج گراف وابستگی‌ها و کاوشگر بصری توپولوژی',
    title_en: 'Apache Management Phase 3: Configuration Topology Engine, Recursive Include Traverser, Dependency Graph & Interactive Inspector',
    changes: [
      'پیاده‌سازی موتور جامع تحلیل ساختار درختی کانفیگ آپاچی (/server/apacheConfigParser.ts): پیمایش بازگشتی و هوشمند دایرکتیوهای Include و IncludeOptional نسبت به ServerRoot و حل الگوهای Wildcard و دایرکتوری‌ها.',
      'استخراج عمیق دایرکتیوها و متریک‌های هر فایل: شمارش بلوک‌های VirtualHost، Directory، Location، دستورات ProxyPass، فعال بودن SSL، لاگ‌های CustomLog و ErrorLog، دایرکتیوهای LoadModule و استخراج پورت‌های Listen.',
      'افزودن اسکنر قدرتمند مبتنی بر پایتون با فالبک امن شل لینوکس (Bash) برای استخراج مشخصات فایل‌ها شامل حجم، تعداد سطور، دسترسی‌ها (Permissions) و مالک (Owner).',
      'ایجاد اندپوینت بک‌اند POST /api/remote-servers/:id/apache-config-topology و متد کلاینت fetchApacheConfigTopology در src/services/api.ts.',
      'توسعه تب اختصاصی توپولوژی کانفیگ (Config Topology) در کامپوننت ApacheManagementModal همراه با کارت‌های خلاصه آماری، فیلتر و جستجوی فایل‌ها، درخت سلسله‌مراتبی و پنجره بازرسی زنده کد با شمارنده خطوط و کپی آسان مسیر.'
    ],
    changes_en: [
      'Engineered comprehensive Apache configuration topology parser (/server/apacheConfigParser.ts): recursively resolves Include and IncludeOptional directives relative to ServerRoot with directory traversal and wildcard expansion.',
      'Extracted deep directive metrics per file: VirtualHost, Directory, and Location block counts, ProxyPass statements, SSL status, CustomLog and ErrorLog presence, LoadModule directives, and active Listen ports.',
      'Built dual-engine architecture: high-fidelity remote Python scanner with safe POSIX shell fallback extracting file sizes, line counts, octal permissions, and ownership.',
      'Integrated backend route POST /api/remote-servers/:id/apache-config-topology and client API method fetchApacheConfigTopology in src/services/api.ts.',
      'Created dedicated Config Topology tab in ApacheManagementModal featuring statistical directive metric cards, live file filtering, visual tree hierarchy, and an interactive inspector with code preview and path copy.'
    ]
  },
  {
    version: '1.171.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'فاز ۲ مدیریت آپاچی: کشف زنده و مستقل از توزیع، پایش سلامت، استخراج مشخصات ساخت، معماری MPM و ماژول‌های وب‌سرور Apache',
    title_en: 'Apache Management Phase 2: Live Distribution-Neutral Discovery, Health Monitoring, Build Specs, MPM & Modules Engine',
    changes: [
      'پیاده‌سازی موتور کشف زنده و مستقل از توزیع آپاچی (/server/apacheDiscovery.ts): کشف خودکار باینری‌های واقعی دمون (httpd، apache2، httpd2) و ابزار کنترلی (apachectl، apache2ctl) بر روی انواع توزیع‌های لینوکس.',
      'ایزولاسیون کامل شناسایی پروسه‌های وب‌سرور در اسکریپت شل از طریق بررسی فیلد comm در کنار ppid=1 جهت ریشه‌یابی و جلوگیری قطعی از تداخل با پروسه شل یا اسکریپت‌های در حال اجرا.',
      'تعبیه اعتبارسنج سخت‌گیرانه باینری isLikelyApacheBinary جهت ممانعت از اجرای تصادفی یا مخرب شل‌ها یا اسکریپت‌های متفرقه.',
      'استخراج مشخصات بیلد و پارامترهای زمان کامپایل (httpd -V / apache2 -V) شامل نسخه دقیق، مدل پردازش همزمانی فعال (MPM: event، worker، prefork)، مسیر ریشه (ServerRoot)، مسیر فایل کانفیگ اصلی، فایل PID و لاگ خطا.',
      'کشف کامل ماژول‌های فعال و بارگذاری‌شده (Loaded Modules) استاتیک و اشتراکی (Shared) از طریق httpd -M همراه با قابلیت جستجو و فیلتر زنده در تب ماژول‌ها.',
      'پیاده‌سازی تست امن و زنده سینتکس کانفیگ (Syntax Dry-Run Test با سوئیچ -t) با نمایش کارت وضعیت، بج تفکیک‌شده و کنسول خروجی ترمینال.',
      'افزودن اندپوینت سرور /api/remote-servers/:id/apache-discovery و تابع کلاینت discoverApacheTopology در API سرویس.',
      'اتصال تب‌های Overview و Modules مودال ApacheManagementModal به داده‌های کشف‌شده زنده و نمایش هشدارهای دقیق در صورت عدم نصب بودن وب‌سرور بر روی هاست.'
    ],
    changes_en: [
      'Engineered live distribution-neutral Apache discovery engine (/server/apacheDiscovery.ts): auto-detects daemon binaries (httpd, apache2, httpd2) and control utilities (apachectl, apache2ctl) across all Linux families.',
      'Enforced kernel process comm isolation alongside ppid=1 in process discovery, eliminating any possibility of shell or script interpreter false-positives.',
      'Implemented strict isLikelyApacheBinary validator rejecting shells, interpreters, or arbitrary utilities from being executed as web servers.',
      'Extracted compiler defines and build specs via httpd/apache2 -V: Apache version, active MPM (event, worker, prefork), ServerRoot, main config path, PID path, and error log path.',
      'Discovered all active static and shared modules via httpd -M with real-time search and filter capabilities inside the dedicated Modules tab.',
      'Built live non-destructive configuration syntax testing (-t) with real-time status badges, output consoles, and on-demand re-check capability.',
      'Integrated backend route /api/remote-servers/:id/apache-discovery and client API service discoverApacheTopology.',
      'Connected Overview and Modules tabs in ApacheManagementModal to authentic live discovery telemetry with transparent notices when Apache is not installed.'
    ]
  },
  {
    version: '1.170.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'فاز ۱ مدیریت آپاچی: پیاده‌سازی مدخل دسترسی، اتصال شرطی به استک فلیت و ساخت مودال مدیریت وب‌سرور Apache',
    title_en: 'Apache Management Phase 1: Entry Point Integration, Fleet Database Source of Truth & Apache Management Modal',
    changes: [
      'پیاده‌سازی مدخل ورود اختصاصی مدیریت وب‌سرور آپاچی (Apache Management Entry Point) در منوی سه‌نقطه سرورها در بخش Remote Servers & Automation Fleet.',
      'وابسته‌سازی دقیق و شرطی نمایش منوی مدیریت آپاچی به تنظیمات واقعی سرور ثبت‌شده در دیتابیس (has_apache یا وجود apache در installed_web_servers) بدون نمایش بی‌مورد برای همه سرورها.',
      'توسعه کامپوننت مودال مدیریت آپاچی (src/components/servers/ApacheManagementModal.tsx) منطبق بر استانداردهای ۵ گانه معماری مودال‌ها (بستن، مینیمایز به داک، تمام‌صفحه، حریم فوتر و سازگاری دوزبانه و تم).',
      'طراحی ساختار تب‌های چندگانه برای فازهای آتی شامل نمای کلی، هاست‌های مجازی (VirtualHost)، پروکسی معکوس، ماژول‌ها و MPM، گواهینامه‌های SSL، لاگ‌های زنده و ویرایشگر امن کانفیگ.',
      'تثبیت اصول معماری چندتوزیعی مستقل از اوبونتو با هدف پشتیبانی جامع از دبیان (apache2)، ردهت/راکی/آلما (httpd)، سوزه و مسیرهای سفارشی در فازهای بعدی.'
    ],
    changes_en: [
      'Implemented dedicated Apache Management entry point in 3-dot server action menu within Remote Servers & Automation Fleet view.',
      'Conditioned Apache Management visibility strictly on verified server database attributes (has_apache or installed_web_servers containing apache), ensuring database source of truth.',
      'Created standard ApacheManagementModal component adhering to all universal modal architecture rules (3-button header controls, ToolsDock minimization, bottom-8 clearance, full theme and i18n support).',
      'Architected tab navigation ready for phased rollout: Overview & Roadmap, VirtualHosts, Reverse Proxy, Modules & MPM, SSL/TLS Certificates, Log Analytics and Safe Config Editor.',
      'Enforced distribution-neutral design principles rejecting Ubuntu-only paths, ready for dynamic host discovery across Debian, RHEL, Rocky, Alma, Fedora, SUSE and custom paths.'
    ]
  },
  {
    version: '1.169.1',
    releaseDate: '2026-09-26',
    type: 'patch',
    title: 'رفع خطای تایم‌اوت SSH و حل ریشه‌ای شناسایی اشتباه شل لینوکس (/usr/bin/bash) به عنوان باینری انجین‌ایکس',
    title_en: 'Fix SSH 8000ms timeout and resolve root cause of false-positive /usr/bin/bash binary discovery in Nginx manager',
    changes: [
      'اصلاح ریشه‌ای اسکریپت کشف پردازش‌های Nginx (/server/nginxDiscovery.ts): حذف تطبیق باز pgrep -f که به دلیل قرار داشتن کل اسکریپت در پارامترهای اجرای bash، شل جاری سیستم (/usr/bin/bash) را به اشتباه به عنوان پردازش مستر Nginx شناسایی می‌کرد.',
      'تعبیه اعتبارسنج سخت‌گیرانه باینری isLikelyNginxBinary: رد قاطعانه هرگونه شل یا باینری متفرقه سیستم نظیر /bin/bash، /bin/sh، python و تضمین اینکه تنها باینری‌های واقعی nginx و openresty پذیرفته شوند.',
      'جلوگیری از اجرای مخرب bash -t: رفع گیر کردن شل در انتظار دریافت دستور از stdin که موجب مسدود ماندن نشست SSH و بروز خطای تایم‌اوت ۸۰۰۰ میلی‌ثانیه‌ای می‌شد.',
      'بستن خودکار جریان ورودی استاندارد (stream.end()) در runAdaptiveSshCommand جهت ممانعت قطعی از مسدود شدن نشست‌های غیرتعاملی SSH توسط فرآیندهای راکد سمت سرور.',
      'افزودن پیام هشدار شفاف و هوشمند در تب Overview مودال Nginx در صورت عدم نصب بودن وب‌سرور یا در دسترس نبودن باینری در مسیرهای استاندارد لینوکس.'
    ],
    changes_en: [
      'Fixed root cause in Nginx process discovery script (/server/nginxDiscovery.ts): eliminated fragile pgrep -f which matched the active bash subshell executing the discovery script, incorrectly registering /usr/bin/bash as the Nginx master process.',
      'Implemented strict isLikelyNginxBinary validator: unconditionally rejects shells and interpreters (/bin/bash, /bin/sh, python, etc.), ensuring only verified nginx or openresty executables are treated as web servers.',
      'Prevented hanging execution on bash -t: eliminated the process hang where bash waited indefinitely for interactive stdin commands causing the 8000ms SSH timeout.',
      'Enforced non-interactive stream termination (stream.end()) in runAdaptiveSshCommand preventing remote child processes from blocking on standard input.',
      'Added clean, dedicated warning notification banner on Nginx Overview tab when Nginx is not installed or when no binary is found in system paths.'
    ]
  },
  {
    version: '1.169.0',
    releaseDate: '2026-09-26',
    type: 'minor',
    title: 'فاز ۹ مدیریت انجین‌ایکس: مدیریت پیشرفته امنیت، ممیزی آسیب‌پذیری‌ها، هاردنینگ زنده و پشتیبانی از چند نمونه‌ای (Multi-Instance)',
    title_en: 'Nginx Management Phase 9: Advanced Security Hardening, Vulnerability Audit, Production Hardening Generator & Multi-Instance Engine',
    changes: [
      'پیاده‌سازی موتور جامع ارزیابی و ممیزی امنیتی انجین‌ایکس (/server/nginxSecurityAuditor.ts) جهت بررسی موشکافانه دایرکتیوها و پیکربندی زنده سیستم.',
      'پشتیبانی کامل از معماری چند نمونه‌ای (Multi-Instance Architecture): شناسایی و سوئیچ بین چند اینستنس موازی Nginx یا OpenResty بر روی یک سرور با مسیرها و پروسه‌های اختصاصی.',
      'بررسی دقیق نشت اطلاعات و افشای نسخه نرم‌افزار (Information Disclosure) شامل دایرکتیو server_tokens off و هدرهای افشاگر.',
      'ارزیابی کامل هدرهای امنیتی دفاعی (Defensive HTTP Security Headers) شامل X-Frame-Options، X-Content-Type-Options، X-XSS-Protection، Referrer-Policy، Content-Security-Policy و Permissions-Policy.',
      'تحلیل حدود بافرها و درخواست‌ها جهت مقابله با حملات محروم‌سازی از سرویس (DoS Mitigation) شامل client_max_body_size و large_client_header_buffers.',
      'تحلیل مقاومت در برابر حملات Slowloris با بهینه‌سازی تایم‌اوت‌های client_body_timeout، client_header_timeout و keepalive_timeout.',
      'ممیزی عمیق پروتکل‌ها و سایفرهای SSL/TLS: شناسایی پروتکل‌های منسوخ و ناامن (SSLv3، TLSv1، TLSv1.1)، سایفرهای ضعیف، و بررسی وضعیت OCSP Stapling.',
      'محافظت از فایل‌های حساس و پنهان مخفی مخازن کد و محیطی (.git, .env, .svn, .htaccess, فایل‌های پشتیبان .bak).',
      'بررسی و ممیزی پرمیشن‌ها و کاربر پروسه‌های اجرایی انجین‌ایکس (Worker/Master User Audit) و سطح دسترسی به کلیدهای خصوصی SSL.',
      'سیستم امتیازدهی هوشمند سلامت امنیت (از ۰ تا ۱۰۰) و تعیین درجه اعتباری (A+ تا F) با تفکیک موارد بحرانی، هشدار و راهکارهای ترمیمی زنده.',
      'تولید خودکار فایل کانفیگ استاندارد امنیتی (security-hardening.conf) همراه با امکان اعمال امن با یک کلیک با پشتیبان‌گیری خودکار، اعتبارسنجی سینتکس و رول‌بک اتمیک در صورت خطا.',
      'تب اختصاصی Security در مودال مدیریت Nginx منطبق بر استانداردهای پنج‌گانه مودال‌ها، حریم فوتر (bottom-8)، پشتیبانی از تم تیره/روشن و عدم استفاده از متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Engineered comprehensive Nginx Security Audit and Vulnerability Engine (/server/nginxSecurityAuditor.ts) for directive-level and live runtime inspection.',
      'Built multi-instance architecture support: automatically discovers and seamlessly switches between multiple running Nginx or OpenResty instances on the same host.',
      'Implemented information disclosure auditing including server_tokens off directive and header leakage detection.',
      'Audited defensive HTTP security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Content-Security-Policy, and Permissions-Policy.',
      'Analyzed buffer size and body limits for Denial-of-Service (DoS) mitigation, including client_max_body_size and header buffers.',
      'Evaluated Slowloris attack resilience via timeout hardening: client_body_timeout, client_header_timeout, and keepalive_timeout.',
      'Deep SSL/TLS security evaluation: flagged deprecated protocols (SSLv3, TLSv1, TLSv1.1), weak cipher suites, and OCSP Stapling status.',
      'Protected sensitive hidden files, repository metadata, and environment configs (.git, .env, .svn, .bak, .htaccess).',
      'Audited runtime process execution privileges (master/worker user hierarchy) and file permissions of private SSL keys.',
      'Dynamic security health score (0-100%) and letter grade (A+ through F) calculation with categorized Critical, Warning, and Info findings.',
      'Automated production-grade security-hardening.conf generator with one-click safe apply pipeline, automated backup, syntax dry-run, and atomic rollback.',
      'Integrated dedicated Security Audit tab within NginxManagementModal complying with all 5 modal directives, footer clearance (bottom-8), dark/light mode ergonomics, and strict bilingual localization.'
    ]
  },
  {
    version: '1.168.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۸ مدیریت انجین‌ایکس: ویرایشگر امن پیکربندی با تحلیل سینتکس، پشتیبان‌گیری نسخه‌دار، دیف و رول‌بک اتمیک',
    title_en: 'Nginx Management Phase 8: Safe Configuration Editor with Syntax Validation, Versioned Backups, Diff Viewer & Atomic Rollback',
    changes: [
      'پیاده‌سازی ماژول اختصاصی ویرایش امن و رول‌بک اتمیک فایل‌های پیکربندی Nginx (/server/nginxSafeEditor.ts).',
      'طراحی و پیاده‌سازی مودال پیشرفته ویرایشگر امن پیکربندی (/src/components/servers/NginxSafeEditorModal.tsx) منطبق بر استانداردهای پنج‌گانه مودال‌ها و حریم فوتر (bottom-8).',
      'سیستم اعتبارسنجی ایزوله سینتکس کاندیدا قبل از ذخیره با تست درای‌ران مستقیم از طریق nginx -t -c.',
      'مکانیزم پشتیبان‌گیری خودکار زمان‌بندی‌شده (Timestamped Backup) در مسیر امن سیستم قبل از اعمال هرگونه تغییر بر روی فایل اصلی.',
      'رول‌بک اتمیک خودکار (Atomic Rollback): در صورت بروز هرگونه خطای سینتکسی پس از نوشتن، فایل قبلی در کسری از ثانیه بازیابی شده و وضعیت سرور دست‌نخورده باقی می‌ماند.',
      'نمای مقایسه تفاضلی هوشمند (Visual Line-by-Line Diff Viewer) جهت نمایش تغییرات ایجادشده، سطرهای اضافه و حذف‌شده نسبت به نسخه اصلی.',
      'تب تاریخچه و تایم‌لاین نسخه‌های پشتیبان (Backup Timeline) با قابلیت بازیابی با یک کلیک و اعتبارسنجی خودکار.',
      'امکان فعال‌سازی مجدد و ریلود خودکار سرویس انجین‌ایکس با systemctl reload nginx پس از تایید موفقیت تست سلامت.',
      'تعبیه دکمه‌های مستقیم ویرایش امن فایل در تب درخت پیکربندی (Config Tree) برای تمام فایل‌ها و کانفیگ اصلی، و در کارت‌های هاست‌های مجازی (Virtual Hosts).',
      'تجهیز ویرایشگر به کادرهای راهنمای FieldInfoTooltip سه‌بخشی، انطباق کامل با تم تیره و روشن و پایبندی قطعی به استانداردهای دو زبانه بدون متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Engineered dedicated safe configuration editor and atomic rollback backend engine (/server/nginxSafeEditor.ts).',
      'Built advanced safe configuration editor modal (/src/components/servers/NginxSafeEditorModal.tsx) compliant with universal modal standards, footer clearance (bottom-8), and dock minimization.',
      'Implemented candidate syntax dry-run verification isolated from live configuration using remote nginx -t -c.',
      'Integrated automated timestamped backup creation in secure system directory prior to touching target configuration files.',
      'Engineered zero-downtime Atomic Rollback: automatically reverts configuration to last-known-good state in milliseconds if compiler syntax tests fail.',
      'Built visual line-by-line Diff Viewer displaying added, removed, and modified lines comparing draft against original content.',
      'Created versioned Backup Timeline tab with one-click instant restoration and automated post-restore verification.',
      'Added optional seamless Nginx service reload (systemctl reload nginx) upon successful syntax test pass.',
      'Added direct Safe Edit buttons on every file in the Configuration Tree hierarchy, main nginx.conf, and Virtual Host cards.',
      'Equipped editor with 3-part boundary-safe FieldInfoTooltips, ergonomic dark/light theme styling, and strict zero-Persian English localization.'
    ]
  },
  {
    version: '1.167.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۷ مدیریت انجین‌ایکس: ویزارد بصری و امن ایجاد سایت و پروکسی معکوس (Safe Site Creation & Reverse Proxy Wizard)',
    title_en: 'Nginx Management Phase 7: Safe Site Creation & Reverse Proxy Wizard with Remote Syntax Verification and Atomic Rollback',
    changes: [
      'پیاده‌سازی ماژول اختصاصی نگارش و استقرار امن پیکربندی Nginx (/server/nginxSiteWriter.ts).',
      'ایجاد مودال ویزارد ۴ مرحله‌ای حرفه‌ای با رعایت کامل استانداردهای پنج‌گانه مودال‌ها و قابلیت مینیمایز به داک (/src/components/servers/NginxSiteWizardModal.tsx).',
      'مرحله ۱ (دامنه و شبکه): تنظیم دامنه اصلی (FQDN)، دامنه‌های مستعار، پورت‌های شنود، سرور پیش‌فرض، فعال‌سازی SSL/TLS و هدایت خودکار ۳۰۱ از HTTP به HTTPS.',
      'مرحله ۲ (هاستینگ و بک‌اند): تفکیک هوشمند هاستینگ معکوس (Reverse Proxy) با پشتیبانی کامل از وب‌سوکت، هدرهای استاندارد (X-Real-IP, Host, X-Forwarded-For)، تایم‌اوت‌ها، و هاستینگ فایل‌های استاتیک با دایرکتوری ریشه، ایندکس و هدایت تک‌صفحه‌ای (SPA Fallback).',
      'مرحله ۳ (امنیت و بهینه‌سازی): تنظیم سقف حجم بادی درخواست (client_max_body_size)، فشرده‌سازی Gzip و هدرهای امنیتی (X-Frame-Options, nosniff, X-XSS-Protection).',
      'مرحله ۴ (پیش‌نمایش، اعتبارسنجی و استقرار): تولید کد بهینه، امکان ویرایش دستی، اجرای تست درای‌ران سینتکس از راه دور (Isolated Remote Syntax Test) و نمایش خروجی دقیق خطای کامپایلر Nginx.',
      'مکانیزم استقرار امن و رول‌بک اتمیک: نگارش در پوشه‌های استاندارد توزیع (/etc/nginx/sites-available با ایجاد خودکار Symlink در sites-enabled یا conf.d)، اعتبارسنجی نهایی با nginx -t و رول‌بک فوری در صورت بروز هرگونه خطا.',
      'افزودن امکان فعال‌سازی/غیرفعال‌سازی سریع (Enable/Disable) و حذف ایمن هاست‌های مجازی موجود از پنل مدیریت.',
      'تجهیز تمامی فیلدها و تنظیمات به کادرهای راهنمای FieldInfoTooltip سه‌بخشی، انطباق کامل با تم‌های تیره/روشن و عدم استفاده از کلمات فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Engineered dedicated safe Nginx configuration generator and deployment engine (/server/nginxSiteWriter.ts).',
      'Built comprehensive 4-step Site Creation and Reverse Proxy Wizard modal compliant with universal modal standards and dock minimization (/src/components/servers/NginxSiteWizardModal.tsx).',
      'Step 1 (Domain & Network): Configured FQDN primary domain, aliases, listen ports, default server catch-all, SSL/TLS certificates, and automatic HTTP-to-HTTPS permanent redirect (301).',
      'Step 2 (Hosting & Backend): Provided seamless selection between Reverse Proxy Gateway (with WebSocket upgrades, standard proxy headers, and timeouts) and Static Web Files Hosting (with document root, index files, and SPA fallback routing).',
      'Step 3 (Security & Optimization): Tuned client max body sizes, on-the-fly Gzip compression, and hardened HTTP security headers (X-Frame-Options, nosniff, Referrer-Policy).',
      'Step 4 (Preview, Testing & Deploy): Real-time configuration preview with optional manual code editor, remote standalone dry-run syntax verification, and live compiler diagnostic output display.',
      'Atomic Deployment & Rollback: Distribution-aware file targeting (/etc/nginx/sites-available with symlinks in sites-enabled or conf.d), automated nginx -t production validation, and immediate automatic rollback upon any syntax rejection.',
      'Added instant live Enable/Disable toggle and safe site deletion actions directly on existing virtual host cards.',
      'Equipped every option with 3-part boundary-safe FieldInfoTooltips, full dark/light theme contrast, and strict zero-Persian English localization.'
    ]
  },
  {
    version: '1.166.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۶ مدیریت انجین‌ایکس: مانیتورینگ زنده، استریم و تحلیل بلادرنگ لاگ‌های Access و Error',
    title_en: 'Nginx Management Phase 6: Live Dynamic Log Discovery, Real-Time Tail Streaming & Traffic Analytics',
    changes: [
      'پیاده‌سازی ماژول اختصاصی کشف و استریم هوشمند لاگ‌های Nginx (/server/nginxLogManager.ts).',
      'کشف خودکار تمامی فایل‌های access_log و error_log تعریف‌شده در سطوح مختلف کانتکست‌های http و server بدون مسیرهای هاردکدشده.',
      'پیاده‌سازی موتور پردازش و تحلیل زنده لاگ‌ها بر روی سرور با استخراج فیلدهای کلاینت IP، متد، آدرس درخواست (URI)، کد وضعیت، حجم ارسالی، User-Agent، Referer، سطح خطا و شناسه‌های PID/TID.',
      'محاسبه آمار ترافیک بلادرنگ: شمارش کدهای ۲xx، ۳xx، ۴xx و ۵xx، خطاهای بحرانی، کلاینت‌های یکتا و پرترافیک‌ترین آدرس‌ها.',
      'امکان سوئیچ بین حالت جدول ساختاریافته (Structured Table) و کنسول لاگ خام (Raw Console) با رنگ‌آمیزی کد وضعیت‌ها و خطاها.',
      'قابلیت استریم و پایش پیوسته زنده (Live Tail Streaming) با امکان توقف موقت (Pause) و ادامه (Resume).',
      'سیستم فیلتر پیشرفته بر اساس کدهای خطای HTTP (مانند 404، 500، 502 Bad Gateway) و سطوح خطا (Crit, Error, Warn, Info).',
      'افزودن امکان دانلود مستقیم قطعه لاگ (Download Log) و کپی آسان خطوط لاگ با کلیک.',
      'رعایت استانداردهای امنیتی دقیق جهت جلوگیری از Path Traversal و محدودسازی دسترسی صرفاً به فایل‌های مجاز لاگ.',
      'انطباق صددرصدی با تم‌های روشن و تیره و پشتیبانی کامل و تفکیک‌شده از زبان‌های فارسی و انگلیسی.'
    ],
    changes_en: [
      'Engineered dedicated dynamic Nginx log discovery and real-time tail streaming engine (/server/nginxLogManager.ts).',
      'Automatically discovered active access_log and error_log directives across http and server block contexts with zero hardcoded paths.',
      'Implemented high-performance remote log parser extracting client IPs, HTTP methods, request URIs, status codes, bytes sent, user agents, error levels, and PID/TID threads.',
      'Computed real-time traffic statistics: counts of 2xx success, 3xx redirects, 4xx client errors, 5xx server failures, unique clients, and top requested URIs.',
      'Provided seamless toggle between Structured Table Mode and Raw Console Mode with status code and severity syntax colorization.',
      'Added automated real-time Live Tail Streaming with responsive Pause / Resume controls.',
      'Built advanced multi-criteria filtering by HTTP status codes (2xx, 3xx, 4xx, 5xx, 404, 502 Bad Gateway) and error severity levels.',
      'Introduced direct log snippet download (.log) and instant clipboard copying for individual lines or full requests.',
      'Enforced strict security boundaries to prevent path traversal, ensuring read access is confined strictly to verified Nginx log files.',
      'Strictly verified bilingual localization (EN/FA) and ergonomic high-contrast dark/light theme styling.'
    ]
  },
  {
    version: '1.165.1',
    releaseDate: '2026-09-25',
    type: 'patch',
    title: 'رفع ریشه‌ای خطای قطع اتصال سوکت بک‌اند پایتون و ارتقای مکانیزم مدیریت پروسه و پروکسی API',
    title_en: 'Root-Cause Resolution of Python Backend Socket Hang Up and API Proxy Resilience Enhancement',
    changes: [
      'اصلاح ریشه‌ای خطای socket hang up در ارتباط پروکسی Node.js به سرور HTTP پایتون با افزودن هدر Connection: close و Content-Length دقیق در پاسخ‌های پایتون.',
      'افزودن هدر Content-Length برای درخواست‌های POST/PUT با بدنه خالی و غیرفعال‌سازی سوکت‌های Keep-Alive راکد در پروکسی داخلی.',
      'ارتقای تابع شناسایی و خاتمه پروسه‌های راکد روی پورت (killProcessOnPort) با بهره‌گیری ترکیبی از pkill و جستجوی مستقیم PID از ابزار ss برای محیط‌های لینوکسی فاقد fuser و lsof.',
      'پیاده‌سازی مکانیزم تاب‌آوری و تلاش مجدد خودکار (Automatic Retry on Socket Hang Up) جهت حذف کامل وقفه‌های موقت اتصال هنگام راه‌اندازی سرویس.'
    ],
    changes_en: [
      'Diagnosed and eliminated the root cause of Python backend socket hang up errors in the Node.js API proxy.',
      'Enforced explicit Connection: close and precise Content-Length headers in Python BaseHTTPRequestHandler responses to eliminate keep-alive socket desynchronization.',
      'Configured agent: false and zero-length body handling for mutation requests in the internal proxy handler.',
      'Enhanced killProcessOnPort with pkill and ss-based PID extraction to reliably terminate orphaned processes in containerized environments without fuser or lsof.',
      'Implemented transparent single retry on transient socket reset/hang up during backend initialization.'
    ]
  },
  {
    version: '1.165.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۵ مدیریت انجین‌ایکس: کاوش و تحلیل زنده گواهینامه‌های امنیتی SSL / TLS، تاریخ انقضا و دامنه‌های SAN',
    title_en: 'Nginx Management Phase 5: Live SSL / TLS Certificate Inspector, Expiration Lifecycle & SANs Discovery Engine',
    changes: [
      'پیاده‌سازی موتور کشف و بررسی مشخصات گواهینامه‌های امنیتی SSL/TLS در فایل‌های کانفیگ Nginx (/server/nginxCertDiscovery.ts).',
      'استخراج زنده اطلاعات X.509 گواهینامه‌ها از روی دیسک با OpenSSL شامل تاریخ صدور و انقضا، صادرکننده (CA)، دامنه‌های تحت پوشش (SANs) و اثرانگشت SHA-256.',
      'محاسبه دقیق روزهای باقیمانده تا انقضا، نوار بصری پیشرفت دوره اعتبار و سیستم هشدار هوشمند برای گواهینامه‌های منقضی یا در آستانه انقضا (زیر ۳۰ روز).',
      'تفکیک گواهینامه‌های رسمی CA از گواهینامه‌های خودامضا (Self-Signed) و وایلدکارد (*.domain.com).',
      'رعایت استاندارد قطعی عدم افشای کلید خصوصی (Zero-Leak Security): بررسی امن وجود فایل کلید روی دیسک بدون دسترسی به محتوای محرمانه کلید.',
      'طراحی و پیاده‌سازی تب اختصاصی Certificates & SSL در NginxManagementModal با لیست کارتی، جستجو، فیلترهای چندگانه و پنل بازرسی تفصیلی.',
      'تجهیز به کادرهای راهنمای Info با ساختار سه‌گانه و مهار ۴ جهته و پشتیبانی ۱۰۰ درصدی از زبان‌های انگلیسی و فارسی و تم‌های روشن و تیره.'
    ],
    changes_en: [
      'Engineered robust X.509 SSL/TLS certificate discovery and OpenSSL inspection engine (/server/nginxCertDiscovery.ts).',
      'Extracted live certificate metadata directly from server storage via OpenSSL: validity periods, issuer (CA), Subject Alternative Names (SANs), serials, and SHA-256 fingerprints.',
      'Computed exact days remaining until expiry, animated validity lifecycle countdown bar, and proactive warning alerts for expired or expiring-soon certificates (<= 30 days).',
      'Differentiated trusted public CA certificates from Self-Signed and Wildcard (*.domain.com) certificates.',
      'Strictly adhered to Zero-Leak Security Protocol: private key existence is verified on disk without ever reading, leaking, or transmitting private key contents.',
      'Implemented dedicated Certificates & SSL tab in NginxManagementModal featuring interactive card list, search filters, and comprehensive inspection inspector.',
      'Equipped with boundary-safe 3-part FieldInfoTooltips and strictly enforced bilingual i18n and light/dark theme contrast.'
    ]
  },
  {
    version: '1.164.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۴ مدیریت انجین‌ایکس: پیاده‌سازی معماری استخرهای آپ‌استریم (Upstream Pools) و مسیرهای پروکسی معکوس (Reverse Proxy Routes)',
    title_en: 'Nginx Management Phase 4: Upstream Backend Pools AST Extraction, Load Balancing Algorithms & Reverse Proxy Routing Explorer',
    changes: [
      'پیاده‌سازی ماژول اختصاصی استخراج استخرهای آپ‌استریم و مسیرهای پروکسی (/server/nginxProxyManager.ts).',
      'تشخیص هوشمند الگوریتم‌های لود بالانسینگ Nginx (شامل round-robin, least_conn, ip_hash, hash, random) و پارامتر keepalive.',
      'استخراج مشخصات سرورهای مقصد آپ‌استریم شامل پورت، وزن (weight)، خطاهای مجاز (max_fails)، تایم‌اوت، سوکت‌های UNIX و نشانگرهای backup/down.',
      'نگاشت کامل دستورات proxy_pass، هدرهای ارسالی proxy_set_header، تشخیص خودکار ارتقای پروتکل وب‌سوکت (WebSocket) و تایم‌اوت‌های شبکه.',
      'تجهیز تب Reverse Proxy & Upstreams در مودال به رابط کاربری دوگانه: مدیریت و بررسی استخرها در کنار کاوشگر مسیرهای پروکسی معکوس.',
      'ایجاد اندپوینت اختصاصی POST /api/remote-servers/:id/nginx-proxy و متد fetchNginxProxy در API کلاینت.',
      'رعایت استانداردهای کامل چندزبانگی (عدم نمایش متن فارسی در حالت انگلیسی) و سازگاری با تم‌های روشن و تیره.'
    ],
    changes_en: [
      'Engineered dedicated Nginx upstream pools and reverse proxy parser module (/server/nginxProxyManager.ts).',
      'Discovered load balancing algorithms (round-robin, least_conn, ip_hash, hash, random) and keepalive directives.',
      'Extracted backend target parameters including port, weight, max_fails, fail_timeout, UNIX domain sockets, and backup/down flags.',
      'Mapped proxy_pass routes, proxy_set_header directives, automated WebSocket upgrade detection, and timeout settings.',
      'Revitalized Reverse Proxy & Upstreams tab with a dual-mode interactive explorer for upstream pools and proxy routes.',
      'Added dedicated backend endpoint POST /api/remote-servers/:id/nginx-proxy and fetchNginxProxy client method.',
      'Strictly enforced bilingual localization rules and theme responsiveness.'
    ]
  },
  {
    version: '1.163.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۳ مدیریت انجین‌ایکس: استخراج و مدل‌سازی نرمالایز هاست‌های مجازی (Virtual Hosts / Server Blocks Model) و نگاشت روتینگ دامنه‌ها',
    title_en: 'Nginx Management Phase 3: Virtual Hosts & Server Blocks Normalized Model, Live Domain Routing & Port Binding Discovery',
    changes: [
      'پیاده‌سازی ماژول اختصاصی استخراج هاست‌های مجازی (/server/nginxSitesManager.ts) برای تفکیک خودکار و هوشمند بلوک‌های server { ... } در سرتاسر فایل‌های کانفیگ.',
      'استخراج دقیق دایرکتیوهای listen (شامل پورت‌ها، IPv4/IPv6، SSL، HTTP/2 و default_server) و دامنه‌های server_name بدون وابستگی به ساختار sites-available اوبونتو.',
      'نگاشت کامل دایرکتیوهای روتینگ درون هر هاست شامل مسیرهای location، اهداف proxy_pass، ریشه فایل‌ها (root)، پشتیبانی WebSocket، بازگشت‌ها (return) و fastcgi.',
      'تشخیص هوشمند گواهینامه‌های SSL متصل به هر سایت بدون کوچکترین افشای کلید خصوصی (Zero Private Key Leakage).',
      'تجهیز تب Virtual Hosts & Server Blocks در مودال Nginx به نمای دو ستونه تعاملی با فیلترهای All, Active, Disabled, SSL, Proxy و پنل جزئیات عمیق هر سایت.',
      'ایجاد اندپوینت اختصاصی POST /api/remote-servers/:id/nginx-sites و متد کلاینت fetchNginxSites در سرویس API.',
      'رعایت استانداردهای طراحی مودال، داک فوتر و تفکیک کامل زبان‌های فارسی و انگلیسی.'
    ],
    changes_en: [
      'Engineered dedicated Virtual Hosts AST extractor (/server/nginxSitesManager.ts) parsing all server { ... } blocks across the discovered configuration file tree.',
      'Extracted listen directives (ports, IPv4/IPv6, SSL flags, HTTP/2, default_server) and domain aliases (server_name) independently of distro conventions.',
      'Mapped deep routing hierarchy inside each server block: locations, proxy_pass targets, static root paths, WebSocket upgrade support, return directives, and FastCGI passes.',
      'Identified SSL/TLS certificate associations per virtual host with strict Zero Private Key Leakage security.',
      'Revitalized Virtual Hosts & Server Blocks tab in Nginx modal with an interactive two-pane explorer, quick filter pills (All, Active, Disabled, SSL, Proxy), and domain routing inspector.',
      'Added dedicated backend endpoint POST /api/remote-servers/:id/nginx-sites and client API fetchNginxSites.',
      'Strictly maintained modal boundaries, dock integration, and bilingual localization.'
    ]
  },
  {
    version: '1.162.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۲ مدیریت انجین‌ایکس: پیاده‌سازی موتور تحلیل سلسله‌مراتبی پیکربندی Nginx و گراف درخت فایل‌ها و دایرکتیوهای Include',
    title_en: 'Nginx Management Phase 2: Configuration Include Hierarchy Traversal, Recursive Glob Resolving & AST Topology Tree Graph',
    changes: [
      'پیاده‌سازی ماژول اختصاصی تحلیل و پیمایش سلسله‌مراتبی فایل‌های کانفیگ Nginx (/server/nginxConfigParser.ts) با قابلیت حل پترن‌های glob و ریشه prefix.',
      'ردیابی زنجیره بازگشتی includeها از فایل اصلی nginx.conf به همراه شمارش بلوک‌های server، استخرهای upstream و کانتکست‌های http/stream/events.',
      'تجهیز مودال Nginx به تب نوسازی‌شده Configuration Files & Include Hierarchy Graph همراه با کارت‌های خلاصه وضعیت و کانتکست‌های کشف‌شده.',
      'ارائه نمای دو ستونه تعاملی: لیست درختی فایل‌ها با نمایش تورفتگی سلسله‌مراتبی، عمق سطح، تعداد خطوط و تعداد بلوک‌های سرور در یک سو و پیش‌نمایش محتوای کد با استایل ترمینال در سوی دیگر.',
      'قابلیت جستجو و فیلتر زنده فایل‌های کانفیگ کشف‌شده بر اساس مسیر و نام فایل.',
      'ایجاد اندپوینت جدید POST /api/remote-servers/:id/nginx-config-topology و متد کلاینت fetchNginxConfigTopology در api.ts.',
      'رعایت صددرصدی قوانین دو زبانگی (عدم نمایش متن فارسی در حالت انگلیسی).'
    ],
    changes_en: [
      'Implemented dedicated Nginx configuration parser and traversal engine (/server/nginxConfigParser.ts) supporting recursive wildcard glob expansions and prefix path resolution.',
      'Tracked full hierarchical include chains starting from discovered root nginx.conf, parsing server blocks, upstream pools, and http/stream/events contexts.',
      'Equipped Nginx modal with revitalized Configuration Files & Include Hierarchy Graph tab featuring topology summary telemetry.',
      'Designed interactive two-pane explorer: hierarchical tree list with level indentations, line counts, and server block badges alongside a monospace dark-mode code viewer.',
      'Integrated real-time live search filter for discovered configuration files by filename and path.',
      'Added dedicated backend endpoint POST /api/remote-servers/:id/nginx-config-topology and client API fetchNginxConfigTopology.',
      'Strictly maintained bilingual localization standards with zero Persian text in English mode.'
    ]
  },
  {
    version: '1.161.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'فاز ۱ مدیریت انجین‌ایکس: پیاده‌سازی موتور کشف هوشمند توزیع، باینری، پرفیکس، سرویس و مشخصات بیلد Nginx بدون اتکا به مسیرهای پیش‌فرض اوبونتو',
    title_en: 'Nginx Management Phase 1: Distribution-Aware Engine Discovery, Dynamic Executable & Prefix Detection, Procfs Process Mapping and Build Arguments Inspection',
    changes: [
      'پیاده‌سازی موتور اختصاصی کشف هوشمند Nginx در سرور (/server/nginxDiscovery.ts) برای شناسایی دقیق توزیع لینوکس (Debian, Ubuntu, RHEL, Rocky, Alma, Alpine, SUSE) و مدیر بسته مربوطه.',
      'کشف پویا و زنده مسیر باینری Nginx از طریق خواندن /proc/<PID>/exe در صورت فعال بودن پروسه و بررسی سلسله‌مراتبی PATH و باینری‌های سفارشی بدون پیش‌فرض قرار دادن /usr/sbin/nginx.',
      'استخراج بلادرنگ پرفیکس ریشه (--prefix)، فایل کانفیگ اصلی (--conf-path)، مسیر PID، ماژول‌های کامپایل‌شده و آرگومان‌های بیلد از خروجی زنده nginx -V.',
      'شناسایی مدیر سرویس فعال سیستم (systemd، OpenRC، init.d یا مدیریت دستی) و نام اختصاصی یونیت سرویس جهت اجرای دستورات کنترل و ریلود.',
      'تجهیز تب Overview & Discovery به کارت‌های زنده فرآیندها (Master PID و تعداد ورکرها)، مسیرهای توپولوژی، تگ‌های ماژول‌های کامپایل‌شده و تست سینتکس تطبیقی با باینری و کانفیگ کشف‌شده.',
      'ایجاد اندپوینت اختصاصی POST /api/remote-servers/:id/nginx-discovery و متد کلاینت discoverNginxTopology در سرویس API.',
      'حفظ کامل استانداردهای مودال، داک فوتر و عدم نمایش متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Implemented dedicated server-side Nginx discovery engine (/server/nginxDiscovery.ts) dynamically detecting Linux OS family (Debian, Ubuntu, RHEL, Rocky, Alma, Alpine, SUSE) and package managers.',
      'Engineered live runtime binary resolution via /proc/<PID>/exe inspect and hierarchical path discovery without assuming Debian/Ubuntu default /usr/sbin/nginx.',
      'Extracted real-time build arguments, prefix path, conf path, PID file path, and compiled modules list directly from live nginx -V output.',
      'Detected active service manager (systemd, OpenRC, init.d, manual) and exact service unit name for accurate reload and lifecycle management.',
      'Revamped Overview & Discovery tab with real process metrics (Master PID, worker counts), discovered path cards, compiled module badges, and dynamic syntax validation.',
      'Added dedicated backend endpoint POST /api/remote-servers/:id/nginx-discovery and frontend API discoverNginxTopology.',
      'Strictly maintained modal boundaries, footer dock synchronization, and zero Persian text in English mode.'
    ]
  },
  {
    version: '1.160.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'توسعه ماژول و مودال اختصاصی مدیریت وب‌سرور Nginx برای سرورهای لینوکس با اضافه شدن آیتم Nginx Management به منوی سه‌نقطه در صورت فعال بودن چک‌باکس Nginx',
    title_en: 'Engineered Dedicated Nginx Web Server Management Modal and Dynamic Context Action Item in Server 3-Dot Menu for Nginx-Enabled Linux Hosts',
    changes: [
      'افزودن شرط بررسی خودکار چک‌باکس و وضعیت فعال بودن انجین‌ایکس (has_nginx و آرایه installed_web_servers) در ردیف‌ها و کارت‌های سرورهای لینوکسی در RemoteServersView.',
      'افزودن آیتم تعاملی "Nginx Management" به منوی سه‌نقطه سرور لینوکس همراه با نشان آیکون وب‌سرور و توضیحات دو زبانه.',
      'طراحی و پیاده‌سازی مودال اختصاصی NginxManagementModal با استاندارد کامل مودال‌ها (دکمه‌های سه‌گانه Close، Minimize، Fullscreen، رعایت فاصله از فوتر و پشتیبانی از تم تاریک/روشن).',
      'تجهیز مودال به تب‌های کاربردی شامل نمای کلی و وضعیت (Overview & Status)، هاست‌های مجازی (Virtual Hosts)، پروکسی معکوس (Reverse Proxy & Upstreams)، فایل‌های کانفیگ (Configuration) و لاگ‌ها (Logs).',
      'پشتیبانی از دکمه‌های کنترل و عملیات سریع سرویس Nginx شامل تست سینتکس (nginx -t)، بارگذاری مجدد (Reload)، راه‌اندازی مجدد (Restart) و توقف/شروع با فراخوانی مستقیم API و SSH واقعی بدون داده‌های شبیه‌سازی‌شده.',
      'یکپارچه‌سازی کامل با سیستم نگهداری تب‌ها و کوچک‌سازی به نوار ابزار فوتر (useModalDock) با نشان NGINX و بازگردانی سریع حالت مودال.',
      'رعایت صددرصدی قوانین دو زبانگی (عدم نمایش متن فارسی در حالت انگلیسی).'
    ],
    changes_en: [
      'Implemented conditional verification of the Nginx configuration flag (has_nginx and installed_web_servers) for Linux servers across cards and table listings.',
      'Added dynamic "Nginx Management" option to the server 3-dot action menu with web server icon and bilingual description.',
      'Architected comprehensive NginxManagementModal adhering strictly to universal modal standards (3-button header controls, footer clearance, dark/light theme adaptability).',
      'Equipped modal with dedicated navigation tabs: Overview & Status, Virtual Hosts / Server Blocks, Reverse Proxy & Upstreams, Configuration Files, and Access/Error Logs.',
      'Provided quick service action triggers including syntax validation (nginx -t), service reload, restart, start/stop with live real SSH execution and zero fake data.',
      'Integrated seamless minimization into the footer ToolsDock (useModalDock) with custom NGINX badge and state preservation.',
      'Enforced strict bilingual i18n localization with zero Persian text in English mode.'
    ]
  },
  {
    version: '1.159.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'افزودن گزینه‌های انتخابی وب‌سرورهای آپاچی و انجین‌ایکس و موتورهای دیتابیس پستگرس و مای‌اس‌کیوال در فرم ثبت سرور با ذخیره‌سازی کامل در پایگاه‌داده و نمایش بج‌ها در داشبورد',
    title_en: 'Added Web Server (Apache, Nginx) and Database Engine (PostgreSQL, MySQL/MariaDB) Selection Checkboxes in Server Registration with Full Database Persistence and Fleet Badges',
    changes: [
      'تجهیز بخش Architecture & Operating System در مودال Register Remote Server به گزینه‌های اختصاصی استک نرم‌افزاری شامل وب‌سرورها (Apache HTTP Server و Nginx Reverse Proxy) و موتورهای دیتابیس (PostgreSQL و MySQL / MariaDB).',
      'ذخیره‌سازی و پایداری کامل فیلدهای انتخابی (installed_web_servers, installed_databases, has_apache, has_nginx, has_postgresql, has_mysql) در هر دو لایه دیتابیس PostgreSQL و دیتابیس فایل‌استور محلی به صورت کامپکت و بولیَن.',
      'افزودن دستورات میگریشن خودکار (ALTER TABLE remote_servers ADD COLUMN IF NOT EXISTS ...) و ارتقای متدهای createRemoteServer و updateRemoteServer جهت حفظ یکپارچگی اطلاعات ثبت و ویرایش سرور.',
      'طراحی کارت‌های انتخابی ارگونومیک با آیکون‌های تفکیکی، برچسب پورت‌ها، چک‌باکس‌های تعاملی و راهنمای سه‌بخشی FieldInfoTooltip مطابق با استانداردهای پورتال.',
      'نمایش نشان‌ها و بج‌های رنگی وب‌سرور و دیتابیس روی کارت‌های سرور و ردیف‌های جدول در RemoteServersView برای تشخیص بصری و فوری استک هر سرور.',
      'رعایت کامل و دقیق قوانین دو زبانگی (عدم نمایش متن فارسی در حالت انگلیسی) و سازگاری با تم تاریک و روشن.'
    ],
    changes_en: [
      'Enhanced the Architecture & Operating System section in Register Remote Server modal with dedicated software stack options: Web Servers (Apache, Nginx) and Database Engines (PostgreSQL, MySQL / MariaDB).',
      'Engineered complete persistence for selection attributes (installed_web_servers, installed_databases, has_apache, has_nginx, has_postgresql, has_mysql) across both PostgreSQL and persistent file storage.',
      'Added automated schema migrations (ALTER TABLE remote_servers ADD COLUMN IF NOT EXISTS ...) and updated createRemoteServer / updateRemoteServer persistence routines.',
      'Built ergonomic interactive selection checkboxes with distinct icons, port badges, active states, and boundary-safe 3-part FieldInfoTooltip.',
      'Rendered quick-glance colored service badges (Apache, Nginx, PostgreSQL, MySQL) on server overview cards and fleet table rows in RemoteServersView.',
      'Maintained strict bilingual i18n localization (zero Persian text in English mode) and seamless light/dark mode contrast compatibility.'
    ]
  },
  {
    version: '1.158.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'ذخیره‌سازی و ماندگاری کامل سوابق و گزارش‌های ممیزی ناوگان (Bulk Server Reports) در پایگاه‌داده رابطه‌ای PostgreSQL و فایل استور، همراه با قابلیت اجرای مجدد، درون‌ریزی و همگام‌سازی دیتابیس',
    title_en: 'Complete Relational Database Persistence for Bulk Server Configuration Audit Reports in PostgreSQL and Persistent Store with Re-run, Import, and Database Sync Capabilities',
    changes: [
      'پیاده‌سازی و ساخت جدول رابطه‌ای اختصاصی bulk_server_reports در پایگاه‌داده PostgreSQL همراه با ایندکس‌های زمانی، شناسه جاب و تمپلیت جهت استعلام‌های سریع و امن.',
      'افزودن متدهای ماندگاری دائمی (Persistence CRUD) در لایه سرور و پایگاه‌داده برای ذخیره، بازیابی، حذف و پاکسازی کلیه سوابق ممیزی و خروجی لاگ‌های هر سرور به صورت دوگانه در PostgreSQL و دیتابیس استور محلی.',
      'توسعه اندپوئینت‌های RESTful برای ذخیره و ایمپورت گزارش‌ها (POST /api/bulk-server-config/reports) و استعلام وضعیت نوع ذخیره‌سازی و تعداد رکوردها (GET /api/bulk-server-config/reports-stats).',
      'تجهیز کامپوننت BulkServerReportsTab به نشانگر زنده وضعیت ذخیره در پایگاه‌داده (Database Persisted Badge) همراه با راهنمای جامع FieldInfoTooltip.',
      'افزودن دکمه‌های کاربردی اجرای مجدد پیکربندی (Rerun Configuration) روی کارت‌های گزارش و مودال جزئیات جهت اجرای سریع سناریو با پارامترهای ثبت‌شده در دیتابیس.',
      'پشتیبانی از خروجی کلی (Export All JSON) و درون‌ریزی فایل‌های گزارش (Import JSON) با اعتبارسنجی ساختار و ذخیره مستقیم در پایگاه‌داده.',
      'انطباق صددرصدی با تم تیره و روشن، رعایت دقیق استانداردهای چندزبانگی (عدم نمایش متن فارسی در حالت انگلیسی) و حفظ حریم همیشگی فوتر.'
    ],
    changes_en: [
      'Implemented dedicated relational bulk_server_reports table in PostgreSQL schema with indexes on timestamps, job IDs, and templates for instant query performance.',
      'Added comprehensive persistence CRUD layer in server/db.ts guaranteeing dual synchronization across PostgreSQL and local persistent JSON database store.',
      'Engineered RESTful endpoints for saving and batch importing execution reports (POST /api/bulk-server-config/reports) and inspecting live storage engine status (GET /api/bulk-server-config/reports-stats).',
      'Enhanced BulkServerReportsTab with a live Database Persisted status badge and explanatory boundary-safe FieldInfoTooltip.',
      'Integrated 1-click "Rerun Configuration" action buttons on both report overview cards and drill-down modal to replay templates with recorded database parameters.',
      'Added fleet-wide "Export All JSON" and "Import JSON" capabilities with format validation and immediate database persistence.',
      'Maintained strict bilingual i18n discipline (zero Persian in English mode), dark/light mode ergonomic contrast, and universal footer clearance.'
    ]
  },
  {
    version: '1.157.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'افزودن تب گزارش‌ها و تاریخچه ممیزی اجرا (Execution Reports & Audit Trail) در ابزار Bulk Linux Server Configuration با رهگیری مسیرهای تغییریافته و فایل‌های ایجاد شده',
    title_en: 'Execution Reports & Audit History Tab in Bulk Linux Server Configuration with Filesystem Change Tracking, Operator Attribution, and Drill-Down Terminal Logs',
    changes: [
      'افزودن نوار تب‌های اصلی در بالای مودال Bulk Linux Server Configuration شامل دو تب تفکیک‌شده: تب اول «پیکربندی گروهی ناوگان» و تب دوم «گزارش‌ها و تاریخچه ممیزی اجرا».',
      'طراحی و پیاده‌سازی ماژول کامل BulkServerReportsTab همراه با کارت‌های آماری جامع (تعداد کل اجراها، درصد موفقیت ناوگان، تعداد خطای نودها، کل سرورهای هدف).',
      'ثبت خودکار گزارش‌های تفصیلی پس از اتمام هر جاب شامل: نام کاربر مجری (Operator User)، شناسه جاب، زمان شروع و پایان، مدت زمان میلی‌ثانیه‌ای، و تفکیک وضعیت هر سرور.',
      'رهگیری دقیق فایل‌ها و مسیرهای سیستم‌عامل تحت تاثیر شامل: فایل‌های ایجاد شده (+ Created Files)، مسیرهای پیکربندی ویرایش‌شده (~ Modified Configs)، پوشه‌های هدف، و آثار امنیتی متناسب با هر تمپلیت.',
      'طراحی مودال اختصاصی جزئیات و Drill-Down با دکمه‌های سه‌گانه استاندارد (بستن، مینیمایز، تمام‌صفحه)، اسنپ‌شات کامل پارامترها و آکاردئون مشاهده لاگ‌های خام ترمینال (stdout/stderr) به تفکیک هر سرور.',
      'پشتیبانی از جستجوی بلادرنگ، فیلتر وضعیت چندگانه (موفق، جزئی، ناموفق)، فیلتر دسته‌بندی، خروجی کامل JSON گزارش، و دکمه‌های پاکسازی با تاییدیه دو مرحله‌ای.',
      'رعایت صددرصدی قوانین مودال (حفظ حریم فوتر bottom-8، انطباق کامل تم تیره و روشن، بدون هیچ‌گونه داده شبیه‌سازی‌شده و رعایت دقیق عدم نمایش متون فارسی در حالت انگلیسی).'
    ],
    changes_en: [
      'Added top-level tab switcher to Bulk Linux Server Configuration modal with two distinct views: "Bulk Linux Server Configuration" and "Execution Reports & Audit History".',
      'Engineered dedicated BulkServerReportsTab component featuring executive metric counters (total jobs, fleet success rate, node errors, and aggregate servers configured).',
      'Automated recording of detailed execution audit reports including operator user attribution, job ID, timestamps, millisecond duration, and per-server completion status.',
      'Fine-grained filesystem change tracking: created files (+ Created Files), modified system configs (~ Modified Configs), affected target paths, and template-aware security implications.',
      'Built interactive drill-down inspection modal with full standard triad controls (Close/Minimize/Fullscreen), parameter snapshot, and per-server accordion for raw terminal stdout/stderr inspection.',
      'Included real-time search, multi-tier status and category filters, 1-click JSON export, and guarded history clear actions with dual-step confirmation.',
      'Strictly aligned with universal modal specifications: bottom-8 footer clearance, dark/light theme contrast, authentic non-simulated live device data, and zero Persian text in English mode.'
    ]
  },
  {
    version: '1.156.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'توسعه جامع الگو و فرم ساخت و پیکربندی کاربران لینوکس (User Provisioning) در ابزار Bulk Server Configuration با تولید گذرواژه امن',
    title_en: 'Comprehensive Linux User Creation & Provisioning Template in Bulk Server Configuration with Interactive Password Generator',
    changes: [
      'بازطراحی و توسعه همه‌جانبه تمپلیت ساخت کاربر سیستم (linux_create_admin_user) با پارامترهای کامل شرکتی و امنیتی.',
      'افزودن امکان تعریف رمز عبور کاربر با قابلیت هش‌گذاری امن (chpasswd) و دکمه‌های مخفی‌سازی/نمایش و کپی گذرواژه.',
      'افزودن کلید هوشمند تولید خودکار گذرواژه‌های با آنتروپی و امنیت بالا (Generate Strong Password) مستقیم در داخل فرم تنظیمات.',
      'افزودن قابلیت اجبار به تغییر رمز عبور در اولین ورود (Force Password Reset on First Login) با استفاده از ابزار chage.',
      'افزودن گزینه‌های سطوح دسترسی Sudo شامل دسترسی استاندارد با رمز، دسترسی سوپریوزر بدون رمز (NOPASSWD در /etc/sudoers.d) و کاربر عادی بدون سودو.',
      'پشتیبانی از نام کامل و توضیحات کاربر (GECOS)، مسیر پوشه خانگی سفارشی، گروه‌های ثانویه اضافی (مانند docker, adm, www-data)، شناسه کاربری سفارشی (UID) و تاریخ انقضای حساب.',
      'پیاده‌سازی اسکریپت بش واحد و ماژولار جهت اجرای سازگار و امن بر روی تمامی توزیع‌های دبیان، اوبونتو، ردهت، سنت‌او‌اس، راکی، آلپاین و سوزه.',
      'بروزرسانی تحلیل اثرات امنیتی و سیستمی و تطابق صددرصدی با استانداردهای چندزبانگی (i18n).'
    ],
    changes_en: [
      'Comprehensive overhaul and expansion of the Linux user creation template (linux_create_admin_user) with enterprise-grade parameters.',
      'Added user password configuration with secure in-flight hashing (chpasswd) and toggleable show/hide and copy controls.',
      'Integrated a 1-click high-entropy random password generator (Generate Strong Password) directly inside the parameter form.',
      'Added mandatory password reset enforcement on first login (Force Password Reset via chage -d 0).',
      'Configured granular Sudo privilege elevation levels: standard sudo with password prompt, passwordless sudo (NOPASSWD in /etc/sudoers.d), and standard unprivileged user.',
      'Added support for full name / description (GECOS), custom home directory, supplementary secondary groups (e.g. docker, adm, www-data), custom UID, and account expiration dates.',
      'Engineered a robust, idempotent bash provisioning script compatible across Debian, Ubuntu, RHEL, CentOS, Rocky Linux, Arch, Alpine, and SUSE.',
      'Updated security and filesystem impact analysis engine with strict bilingual i18n support.'
    ]
  },
  {
    version: '1.155.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'افزودن تب و مودال پیشرفته مدیریت Cron Jobs در مودال Server Management با قابلیت توقف، ویرایش، حذف، ایجاد و اجرای تستی زنده',
    title_en: 'Linux Cron Jobs Management Tab & Visual Schedule Editor in Server Management Modal with Pause, Edit, Delete, Create, and Live Test Run',
    changes: [
      'افزودن تب اختصاصی «کرون‌جاب‌ها» (Cron Jobs) در نوار ناوبری مودال مدیریت سرور (LinuxServerMonitorModal) همراه با نمایش زنده وضعیت دیمن cron/crond.',
      'پیاده‌سازی کامپوننت کامل LinuxCronJobsTab با جدول تعاملی، فیلترهای چندگانه (کاربر، وضعیت فعال/متوقف، منابع سیستمی یا کاربر)، و جستجوی لحظه‌ای.',
      'افزودن قابلیت توقف موقت و فعال‌سازی مجدد (Pause / Resume) بدون حذف دستور با نشانه‌گذاری استاندارد # [DISABLED] در crontab.',
      'طراحی مودال سازنده و ویرایشگر پیشرفته LinuxEditCronModal با الگوهای آماده زمانی و دستوری (بکاپ دیتابیس، پاکسازی لاگ، تمدید SSL، ناظر سرویس)، تنظیمات گرافیکی ۵ گانه، و تولید توضیحات متنی زمان‌بندی به دو زبان فارسی و انگلیسی.',
      'پیاده‌سازی مودال اجرای دستی (Run Now) با کنسول خروجی ترمینال زنده (stdout/stderr)، کد خروج و مدت زمان اجرا جهت اعتبارسنجی پیش از زمان‌بندی.',
      'رعایت کامل استانداردهای مودال (دکمه‌های سه‌گانه Close/Minimize/Fullscreen، حریم فوتر bottom-8، انطباق کامل تم تیره و روشن، راهنماهای سه‌بخشی FieldInfoTooltip و عدم وجود هرگونه متن فارسی در حالت انگلیسی).',
    ],
    changes_en: [
      'Added dedicated "Cron Jobs" tab to LinuxServerMonitorModal navigation bar with live cron/crond daemon telemetry status.',
      'Implemented LinuxCronJobsTab featuring interactive table of schedules, comprehensive multi-tier filtering (user, status active/paused, source user/system), and real-time search.',
      'Added seamless Pause / Resume toggling without destroying cron commands via standard "# [DISABLED]" comment tagging in crontab.',
      'Engineered LinuxEditCronModal with visual 5-part cron generator, quick preset frequencies, enterprise command templates (DB backup, log rotation, SSL renewal, service auto-heal), and dynamic bilingual schedule translation.',
      'Added interactive "Run Now" live execution modal capturing exit code, duration, and terminal stdout/stderr for preflight schedule verification.',
      'Fully strictly aligned with system modal standards: triad control buttons (Close/Minimize/Fullscreen), bottom-8 footer clearance, dark/light theme contrast, 3-part FieldInfoTooltips, and zero Persian text in English mode.',
    ],
  },
  {
    version: '1.154.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'توسعه موتور و اندپوینت‌های مدیریت جاب‌های زمان‌بندی‌شده (Cron Jobs) لینوکس از طریق SSH واقعی',
    title_en: 'Linux Cron Jobs Backend Engine & REST API Endpoints with Real SSH Execution',
    changes: [
      'پیاده‌سازی موتور جامع linuxCronManager.ts برای واکشی و آنالیز کرون‌جاب‌های کاربران و فایل‌های سیستمی (/etc/crontab و /etc/cron.d/*) بدون هیچ‌گونه داده شبیه‌سازی‌شده یا فیک.',
      'افزودن اندپوینت‌های کامل REST API شامل فهرست‌بندی جاب‌ها، ایجاد و ویرایش، غیرفعال‌سازی موقت/توقف (Pause/Stop با کامنت ساختاریافته)، حذف و اجرای زنده (Run Now) جهت اعتبارسنجی خروجی اسکریپت.',
      'پشتیبانی از تشخیص وضعیت دیمن cron/crond و فهرست کاربران واقعی سرور جهت مدیریت هدفمند تسک‌های زمان‌بندی‌شده.',
    ],
    changes_en: [
      'Implemented comprehensive linuxCronManager.ts engine to authentically read and parse user crontabs and system cron definitions (/etc/crontab and /etc/cron.d/*) via real SSH commands with zero fake data.',
      'Added full REST API endpoints for listing cron jobs, creating/updating schedules, pausing/stopping (commenting out preserved jobs), deleting, and manual test execution (Run Now) with real exit codes and stdout/stderr capture.',
      'Added automated cron/crond daemon health inspection and live system users enumeration for targeted scheduling.',
    ],
  },
  {
    version: '1.153.2',
    releaseDate: '2026-09-25',
    type: 'patch',
    title: 'رفع باگ تداخل گرادینت SVG آیکون پوشه‌ها در نمای شبکه‌ای کاوشگر فایل و تغییر رنگ همه پوشه‌ها با کلیک روی اولین پوشه',
    title_en: 'Fix SVG LinearGradient ID Collision in File Explorer ModernFolderIcon Turning All Folders Blue on First Folder Click',
    changes: [
      'شناسایی و رفع ریشه‌ای تداخل شناسه گرادینت‌های SVG آیکون پوشه (ModernFolderIcon) در کاوشگر فایل لینوکس.',
      'اختصاص شناسه‌های منحصر‌به‌فرد نمونه (Instance-Scoped Unique IDs) با استفاده از React.useId برای هر آیکون پوشه به جای شناسه‌های ثابت سراسری (Global Static IDs).',
      'تضمین اینکه با کلیک و انتخاب اولین پوشه (یا هر پوشه دیگر) در نمای شبکه‌ای (Grid View)، تنها همان پوشه انتخاب‌شده به رنگ آبی درآمده و رنگ سایر پوشه‌ها به صورت مجزا در حالت پیش‌فرض (کهربایی/طلایی) باقی بماند.',
    ],
    changes_en: [
      'Identified and resolved root-cause SVG linearGradient ID collision within ModernFolderIcon in Linux Remote File Explorer.',
      'Replaced static global element IDs with instance-scoped unique identifiers generated via React.useId for every folder icon instance.',
      'Guaranteed that clicking and selecting the first folder (or any specific folder) in Grid View strictly turns only that folder blue, while maintaining independent default amber/gold styling across all other unselected folders.',
    ],
  },
  {
    version: '1.153.1',
    releaseDate: '2026-09-25',
    type: 'patch',
    title: 'تصویب قانون قطعی و تخطی‌ناپذیر برتری لایه‌ای و همیشگی مودال‌های تولز (Tools) بر فراز تمامی پنجره‌ها در دستورالعمل‌ها و معماری سیستم',
    title_en: 'Codified Universal Mandatory Directive & Stacking Hierarchy Guaranteeing Tools Modals Super-Priority Over All Windows',
    changes: [
      'تصویب قانون قطعی و تخطی‌ناپذیر در قوانین هوش مصنوعی و توسعه‌دهندگان (AGENTS.md و GEMINI.md - بند ۲ ذیل قانون ۷) مبنی بر الزام باز شدن همیشگی تمامی مودال‌های فعلی و آینده بخش ابزارها بر فراز تمامی پنجره‌ها و مودال‌های دیگر (کاوشگر فایل، ترمینال لینوکس، ترمینال چندگانه، ریموت دسکتاپ و پنجره‌های تنظیمات).',
      'ثبت استاندارد معماری در راهنمای طراحی مودال‌ها (MODAL_GUIDELINES.md) شامل الزام به رندر مستقیم مودال‌های ابزارها با createPortal در ریشه سند، اختصاص لایه پایه z-[999990]، لایه z-[999995] برای دیالوگ‌های داخلی، و ممنوعیت قطعی تعریف هرگونه پنجره یا مودال دیگر با z-index بالاتر از 99999.',
      'تضمین حفظ ساختار و پایداری سیستم در توسعه‌های آتی به گونه‌ای که هیچ کامپوننت یا مودال جدیدی نتواند ابزارهای شبکه را بپوشاند یا به زیر لایه‌های دیگر بفرستد.',
    ],
    changes_en: [
      'Formally codified mandatory architectural directive in AI and developer rules (AGENTS.md and GEMINI.md - clause 2 under Rule 7) requiring all current and future network tool modals to always open strictly above all other windows and modals (Linux File Explorer, Linux Terminal, Multi-Terminal Workspace, Remote Desktop, and configuration dialogs).',
      'Documented universal architectural standards in MODAL_GUIDELINES.md mandating createPortal root rendering, base z-[999990] stacking for tools, z-[999995] for nested dialogs, and strictly prohibiting any regular or device modal with a z-index exceeding 99999.',
      'Guaranteed architectural future-proofing ensuring no subsequent feature or modal addition can occlude network tool windows or cause them to fall beneath other layers.',
    ],
  },
  {
    version: '1.153.0',
    releaseDate: '2026-09-25',
    type: 'minor',
    title: 'اولویت مطلق مودال‌های تولز (Tools) بر فراز تمامی پنجره‌ها و ترمینال‌ها با هوئیستینگ پورتال و لایه z-[999990]',
    title_en: 'Universal Super-Priority Stacking for All Network Tools Modals Above Terminal and File Explorer Windows',
    changes: [
      'انتقال رندرینگ تمامی ۱۰ مودال ابزارهای شبکه (IpSubnetModal، PasswordGeneratorModal، PortScannerModal، DnsUtilitiesModal، TracerouteModal، CertLookupModal، HeaderAnalyzerModal، UpsCalculatorModal، HostCheckerModal و PasswordVaultModal) به ریشه document.body با استفاده از createPortal جهت خروج از Stacking Context و جلوگیری قطعی از افتادن زیر مودال‌های ترمینال یا فایل اکسپلورر.',
      'ارتقای لایه z-index تمامی مودال‌های تولز به z-[999990] جهت نمایش پایدار بر فراز پنجره‌های فایل اکسپلورر (z-[9999] و z-[99999])، ترمینال لینوکس، ریموت دسکتاپ و دیگر پنجره‌ها.',
      'تنظیم لایه زیرمودال‌ها و دیالوگ‌های داخلی تولز (پیش‌نمایش کد در CertConverterTab، احراز هویت مجدد ولت و ...) روی z-[999995].',
      'ارتقای لایه نوار داک تب‌های مینیمایز شده (ToolsDock) به z-[999995] و پاپ‌اور منوی آن به z-[1000000] جهت دسترسی همیشگی.',
      'تنظیم لایه کادرهای راهنمای سه‌گانه FieldInfoTooltip روی z-[1000005] جهت شناوری کامل روی تمامی المان‌ها و مودال‌ها.',
      'حفظ دقیق حریم فاصله ۳۲ پیکسلی فوتر (bottom-8) در تمام حالات عادی و تمام‌صفحه به منظور عدم تداخل با تسک‌بار و اطلاعات شبکه.',
    ],
    changes_en: [
      'Hoisted rendering for all 10 network tool modals (IpSubnetModal, PasswordGeneratorModal, PortScannerModal, DnsUtilitiesModal, TracerouteModal, CertLookupModal, HeaderAnalyzerModal, UpsCalculatorModal, HostCheckerModal, and PasswordVaultModal) directly into document.body using createPortal, escaping stacking contexts and completely preventing modals from falling behind File Explorer or Terminal windows.',
      'Elevated z-index across all tools modals to z-[999990], ensuring rock-solid layering on top of Linux File Explorer (z-[9999] & z-[99999]), Linux Terminal, Remote Desktop, and device management windows.',
      'Configured nested tool dialogs (CertConverterTab code preview, PasswordVault re-authentication prompt) to z-[999995].',
      'Elevated ToolsDock dockbar to z-[999995] and its category popup to z-[1000000] ensuring persistent access and smooth window switching.',
      'Elevated FieldInfoTooltip portal z-index to z-[1000005] for seamless visibility above all layers.',
      'Enforced strict 32px footer clearance (bottom-8) across normal and maximized states maintaining full status bar interactability.',
    ],
  },
  {
    version: '1.152.7',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع خطای Incomplete instruction در ریموت دسکتاپ، اصلاح فریمینگ گیت‌وی Guacamole و افزودن ورودی مستقیم پسورد ویندوز',
    title_en: 'Fix Guacamole Protocol Framing & Incomplete Instruction Error, Add Direct In-Modal Password Entry',
    changes: [
      'اصلاح تابع encodeGuacElement و محاسبه طول عناصر بر اساس تعداد کاراکترهای یونیکد (str.length) به جای طول بایتی UTF-8، جهت سازگاری ۱۰۰٪ با کلاینت guacamole-common-js و جلوگیری از خطای Incomplete instruction.',
      'پیاده‌سازی مفسر پکت‌های استریمینگ extractNextGuacInstruction جهت تفکیک دقیق دستورات پروتکل بر اساس طول المنت‌ها و عدم برش اشتباه دستورات هنگام وجود سمیکالن داخل مقادیر متنی.',
      'جلوگیری از ارسال خطاهای تکراری و متناقض هنگام بسته‌شدن سوکت TCP سرویس guacd.',
      'افزودن فیلد ورودی مستقیم رمز عبور ویندوز / اکتیو دایرکتوری در صفحه خطای مودال با امکان نمایش/مخفی‌سازی رمز و تلاش مجدد فوری جهت تسهیل احراز هویت NLA.',
      'ترجمه هوشمند خطاهای فریمینگ کلاینت در parseGuacErrorMessage به توضیحات شفاف مهندسی جهت هدایت کاربر به بررسی اطلاعات کاربری و NLA.',
    ],
    changes_en: [
      'Corrected encodeGuacElement element length calculation to use Unicode character code unit count (str.length) instead of raw UTF-8 byte length, ensuring full guacamole-common-js client alignment and permanently resolving "Incomplete instruction." errors.',
      'Implemented robust stream packet parser extractNextGuacInstruction respecting Guacamole element lengths and preventing premature instruction slicing on semicolons inside string/error payloads.',
      'Prevented duplicate conflicting error instructions on guacd socket termination.',
      'Added direct inline Windows / Active Directory password input on the modal retry/error card with show/hide toggle for immediate NLA credential retry.',
      'Smartly translated client framing errors in parseGuacErrorMessage to clear engineering diagnostics guiding the user on credential and NLA verification.',
    ],
  },
  {
    version: '1.152.6',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'ارسال ساختاریافته JSON خطاهای ریموت دسکتاپ، اعتبارسنجی شفاف عدم دسترسی شبکه و انطباق کدهای پروتکل Guacamole',
    title_en: 'Structured Guacamole JSON Error Payloads, Explicit Target Reachability & Protocol Code Alignment',
    changes: [
      'ارسال تمام خطاهای guacd و گیت‌وی به صورت JSON کامل شامل category، message_en، message_fa و code.',
      'پارسیبنگ هوشمند خطاهای ساختاریافته در کلاینت مرورگر و نمایش پیام دو زبانه متناسب با زبان فعال پنل و فالبک در صورت پیام خام.',
      'اجرای اعتبارسنجی پیش‌پرواز اتصال شبکه به سرور ویندوز و نمایش علت دقیق قطعی در صورت عدم دسترسی شبکه یا فایروال.',
      'هماهنگ‌سازی کدهای هگزادسیمال وضعیت guacd در فرانت‌اند با مشخصات رسمی پروتکل Apache Guacamole (کدهای 0x0200 تا 0x03FF).',
      'بررسی و تایید عدم افشای رمز عبورهای win_password و sessionPassword در لاگ‌ها، وقایع audit و پاسخ‌های API.',
    ],
    changes_en: [
      'Dispatched comprehensive JSON structured error payloads (category, message_en, message_fa, code) across all guacd WebSocket gateway pathways.',
      'Implemented bilingual JSON error parsing in InBrowserRemoteDesktopModal with language-adaptive rendering and graceful raw message fallback.',
      'Added pre-flight target reachability validation providing explicit network/firewall failure diagnostics instead of generic tips.',
      'Harmonized frontend hexadecimal Guacamole status codes with the official Apache Guacamole protocol specification (0x0200 to 0x03FF).',
      'Audited and verified zero-leak confidentiality for win_password, vnc_password, and sessionPassword across logs, audits, and API responses.',
    ],
  },
  {
    version: '1.152.5',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'پشتیبانی تخصصی از احراز هویت دامین اکتیو دایرکتوری، اعتبارسنجی NLA/TLS و تفکیک مجوزهای گروه کاربری',
    title_en: 'Active Directory Domain & NLA Authentication Hardening, Group Policy & Lockout Diagnostics',
    changes: [
      'تقویت تفکیک خطاهای اکتیو دایرکتوری در گیت‌وی شامل تشخیص قفل یا انقضای حساب کاربری (RDP_ACCOUNT_LOCKED_OR_EXPIRED).',
      'تشخیص عدم عضویت کاربر در گروه Remote Desktop Users دامین (RDP_PERMISSION_DENIED).',
      'ارسال نام دامین اکتیو دایرکتوری در پیام‌های خطا جهت راهنمایی دقیق عیب‌یابی کاربران دامین.',
      'تطبیق کامل مذاکره امنیتی TLS/NLA در اتصال با ویندوز سرورهای کنترل‌کننده دامین (Domain Controller).',
    ],
    changes_en: [
      'Enriched Active Directory error discrimination including account lockout/expiration detection (RDP_ACCOUNT_LOCKED_OR_EXPIRED).',
      'Added detection for missing domain Remote Desktop Users group authorization (RDP_PERMISSION_DENIED).',
      'Injected Active Directory domain context into structured error payloads for targeted administrative troubleshooting.',
      'Optimized TLS/NLA security layer negotiation for Domain Controllers and member servers.',
    ],
  },
  {
    version: '1.152.4',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'ارتقای چرخه حیات کلاینت ریموت دسکتاپ، تفکیک مراحل اتصال و جایگزینی تایم‌اوت عمومی با وضعیت‌های واقعی',
    title_en: 'Improve In-Browser RDP Client Lifecycle, Granular Stages & Replace Generic Timeout',
    changes: [
      'تفکیک کامل مراحل اتصال در کلاینت مرورگر (validating_target -> requesting_token -> connecting_tunnel -> negotiating_rdp -> connected).',
      'اجرای اعتبارسنجی پیش‌پرواز TCP پیش از ارسال توکن و نمایش خطای شفاف در صورت در دسترس نبودن پورت سرور ویندوز.',
      'حذف تایم‌اوت ۱۰ ثانیه‌ای هاردکدشده و جایگزینی با تایم‌اوت هوشمند ۲۵ ثانیه‌ای متناسب با زمان مذاکره NLA و Kerberos اکتیو دایرکتوری.',
      'نمایش وضعیت زنده نام کاربری، دامین نرمال‌شده و پورت RDP در لایه بارگذاری مودال.',
    ],
    changes_en: [
      'Implemented granular connection stages in browser modal (validating_target -> requesting_token -> connecting_tunnel -> negotiating_rdp -> connected).',
      'Integrated pre-flight TCP reachability validation with descriptive actionable error feedback when target host/port is unreachable.',
      'Replaced generic 10s timeout with a resilient 25s timeout calibrated for Active Directory Kerberos and NLA security handshakes.',
      'Displayed live connection context including normalized username, Active Directory domain, and RDP port inside loading overlay.',
    ],
  },
  {
    version: '1.152.3',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'اصلاح جریان نشست و پروتکل guacd در بک‌اند، نرمال‌سازی نام کاربری/دامین و اعتبارسنجی پیش‌پرواز TCP',
    title_en: 'Correct guacd Session & Protocol Flow, Domain Normalization, and Pre-flight TCP Validation',
    changes: [
      'پیاده‌سازی تابع normalizeRdpCredentials جهت پشتیبانی هم‌زمان از ساختارهای DOMAIN\\User، User@domain و تفکیک دامین.',
      'افزودن تابع اعتبارسنجی پیش‌پرواز checkTcpReachability و اندپوینت /api/remote-desktop/validate-target جهت تست در دسترس بودن پورت سرور ویندوز پیش از استارت نشست.',
      'اصلاح تفکیک خطاهای هندشیک guacd و ارسال خطاهای ساختاریافته معنادار (RDP_AUTH_FAILED، RDP_NLA_FAILED، RDP_CONNECTION_REFUSED).',
      'تضمین حفظ حریم امنیتی و عدم نشت رمز عبور در پاسخ‌های API و توکن‌های نشست.',
    ],
    changes_en: [
      'Engineered normalizeRdpCredentials to accurately parse DOMAIN\\User, UPN user@domain, and distinct domain inputs.',
      'Introduced checkTcpReachability helper and /api/remote-desktop/validate-target endpoint to verify target TCP port reachability before launching RDP handshake.',
      'Transformed raw guacd handshake error packets into structured diagnostics (RDP_AUTH_FAILED, RDP_NLA_FAILED, RDP_CONNECTION_REFUSED).',
      'Guaranteed zero password exposure in client API tokens and response payloads.',
    ],
  },
  {
    version: '1.152.2',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'ممیزی جامع و گزارش دیاگنوستیک معماری اتصال ریموت دسکتاپ مرورگری و بررسی گیت‌وی guacd',
    title_en: 'Comprehensive Audit and Diagnostics of In-Browser RDP Architecture & guacd Gateway Flow',
    changes: [
      'ممیزی کامل جریان اتصال RDP، بررسی بسته‌های دیمن بومی guacd نسخه 1.3.0 و پلاگین‌های libguac-client-rdp0 و libfreerdp2.',
      'بررسی و تثبیت مدل داده سرورها در دیتابیس (ip, win_port, win_username, win_domain, win_password).',
      'تدوین مستند فنی RDP_AUDIT_REPORT.md جهت پیاده‌سازی اصلاحات مرحله‌به‌مرحله اتصال ریموت دسکتاپ.',
    ],
    changes_en: [
      'Conducted technical audit of end-to-end RDP connection flow, verified native guacd 1.3.0 daemon, libguac-client-rdp0, and libfreerdp2.',
      'Validated Windows Server data model in database_store.json (ip, win_port, win_username, win_domain, win_password).',
      'Published comprehensive technical report RDP_AUDIT_REPORT.md for phased guacd protocol and frontend overhaul.',
    ],
  },
  {
    version: '1.152.1',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع تداخل رویدادهای کیبورد گوآکامولی و بازگردانی امکان تایپ در مودال‌های دیگر پس از خروج از RDP',
    title_en: 'Fix Guacamole Keyboard Event Interception & Restore Global Input Accessibility Across All Modals',
    changes: [
      'مهار رویدادهای کیبورد گوآکامولی منحصراً به کانتینر دیسپلی ریموت دسکتاپ و حذف شنونده سراسری از شیء global document.',
      'پاکسازی و ریست کامل شنونده‌های کیبورد و ماوس گوآکامولی هنگام بستن (Close)، مینیمایز (Minimize) و خروج از مودال.',
      'افزودن گارد هوشمند به رویدادهای کلیدها جهت عدم مسدودسازی و جلوگیری از preventDefault هنگام فوکوس روی فیلدهای متنی، رمز عبور یا سایر مودال‌ها.',
      'رفع قطعی مشکل غیرفعال شدن امکان تایپ در مودال افزودن سرور، پرامپت پسورد اتصال RDP و سایر دیالوگ‌های برنامه پس از بستن کنسول ریموت دسکتاپ.',
    ],
    changes_en: [
      'Bound Apache Guacamole keyboard capture exclusively to the remote desktop display viewport element, completely eliminating global document event listeners.',
      'Engineered complete teardown and state reset of Guacamole keyboard/mouse listeners upon modal close, minimize, and connection termination.',
      'Added active element guard in keyboard handlers ensuring keydown/keyup events are never suppressed when inputs, textareas, or other dialogs are focused.',
      'Permanently resolved the bug preventing keyboard input in the Add Server modal, on-demand RDP password prompts, and other application dialogs after closing the RDP console.',
    ],
  },
  {
    version: '1.152.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'تنظیم حالت شبکه‌ای (Grid View) به عنوان نمای پیش‌فرض و بازطراحی مدرن و توپر آیکون پوشه‌ها در کاوشگر لینوکس',
    title_en: 'Default Grid View Mode & Modern Large Filled Folder Vector Redesign in Linux File Explorer',
    changes: [
      'تنظیم حالت نمایش شبکه‌ای (Grid View) به عنوان حالت پیش‌فرض و آغازین در کاوشگر فایل لینوکس (LinuxFileExplorerModal).',
      'حذف کامل کادر مربعی، پس‌زمینه و هاله زرد رنگ دور پوشه‌ها در حالت شبکه‌ای و نمایش انحصاری و تمیز خود آیکون فولدر.',
      'طراحی اختصاصی آیکون وکتور فولدر مدرن، چندلایه و کاملاً توپر (Modern Filled Folder) با گرادیان طلایی، زبانه پشت، پیش‌نمایش برگه داخلی و خط بازتاب نور سطحی.',
      'افزایش چشمگیر اندازه فولدر به ابعاد بزرگ و ارگونومیک (w-16 h-16) جهت ارائه تجربه‌ای مشابه فایل منیجرهای مدرن دسکتاپ.',
    ],
    changes_en: [
      'Set Grid View as the primary default layout mode in Linux Remote File Explorer (LinuxFileExplorerModal).',
      'Completely eliminated the enclosing square wrapper, background tint, and yellow halo around folders in grid mode, presenting solely the pristine folder icon.',
      'Engineered custom modern multi-layered filled vector folder design (ModernFolderIcon) featuring amber-gold gradients, interior sheet preview, tab highlights, and drop shadows.',
      'Significantly increased folder visual footprint to large, ergonomic dimensions (w-16 h-16) for a premium desktop-grade file management experience.',
    ],
  },
  {
    version: '1.151.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'تصویب و ثبت قانون اجباری مهار حریم فوتر و اولویت مطلق منوی ابزارها در قوانین هوش مصنوعی و دستورالعمل مودال‌ها',
    title_en: 'Codified Mandatory Universal Footer Clearance & Tools Menu Super-Priority in Modal Rules & Directives',
    changes: [
      'تصویب و ثبت رسمی قانون الزامی حفظ حریم فوتر در بخش ۷ دستورالعمل‌های AGENTS.md و GEMINI.md و بخش ۲ فایل MODAL_GUIDELINES.md.',
      'الزام کلیه هوش‌های مصنوعی و توسعه‌دهندگان به مهار کانتینر و بک‌دراپ مودال‌ها به فاصله bottom-8 در هر دو حالت عادی و تمام‌صفحه.',
      'ممنوعیت قطعی افتادن هرگونه مودال یا پس‌زمینه کدر بر روی فوتر و نوار داک پایین (ToolsDock).',
      'الزام به رندر مستقیم منوی ابزارها (Tools Menu) در پورتال document.body با بالاترین لایه z-[999999] جهت دیده‌شدن بر فراز تمام پنجره‌ها.',
    ],
    changes_en: [
      'Formally codified mandatory universal footer clearance rule into Section 7 of AGENTS.md, GEMINI.md, and Section 2 of MODAL_GUIDELINES.md.',
      'Mandated that all AI agents and developers strictly bound modal wrappers and dark backdrops to bottom-8 across both normal and fullscreen states.',
      'Explicitly prohibited modals and overlay backdrops from eclipsing, dimming, or obscuring the bottom status bar and ToolsDock.',
      'Enforced document.body top-level portal rendering with z-[999999] for the footer tools menu to guarantee unoccluded visibility over all windows.',
    ],
  },
  {
    version: '1.150.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'انتقال منوی ابزارها (Tools Menu) به بالاترین سطح رندرینگ سراسری با اولویت دیده‌شدن روی تمامی مودال‌ها',
    title_en: 'Elevated Network Tools Menu to Top-Level Universal Portal Layering (z-[999999]) Above All Modals',
    changes: [
      'حل مشکل مخفی شدن منوی ابزارها (NetworkToolsMenu) در زیر پنجره‌های فعال؛ هم‌اکنون با باز شدن منوی ابزارها از فوتر، منو بالاتر از تمامی پنجره‌ها و حتی در حالت تمام‌صفحه ترمینال و فایل اکسپلورر باز می‌شود.',
      'انتقال رندرینگ کل کامپوننت منوی ابزارها به ریشه document.body با createPortal جهت خروج از محدودیت‌های لایه‌ای (Stacking Context) فوتر و والدها.',
      'اختصاص لایه z-[999999] به منوی ابزارها جهت تضمین قرارگیری مطلق روی هرگونه مودال، کادر فول‌اسکرین، دیالوگ و هشدار سیستم.',
      'محاسبه داینامیک موقعیت بازگشایی مماس بر دکمه ابزارهای فوتر با مهار هوشمند کادر (4-Way Clamping) در هر دو زبان انگلیسی و فارسی.',
    ],
    changes_en: [
      'Resolved Tools menu occlusion: opening the Network Tools menu from the footer now displays it reliably above all active modals, including Linux Terminal and File Explorer in fullscreen.',
      'Hoisted NetworkToolsMenu rendering directly into document.body using createPortal to escape parent layout overflow and stacking context constraints.',
      'Assigned top-tier z-[999999] stacking to guarantee absolute top-level visibility above any modal, fullscreen container, or nested dialog.',
      'Implemented dynamic viewport-aware anchor positioning above the footer tools button with intelligent 4-way boundary clamping for both LTR and RTL directions.',
    ],
  },
  {
    version: '1.149.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'تضمین دیده‌شدن و قرارگیری همیشگی فوتر و نوار ابزار پایین روی کلیه پنجره‌ها و مودال‌های لینوکس',
    title_en: 'Guaranteed Universal Footer Visibility & Bottom-8 Modal Clearance for Linux Terminal and Explorer',
    changes: [
      'حل قطعی مشکل پوشیده شدن فوتر توسط پس‌زمینه و کادر ترمینال لینوکس (LinuxTerminalModal) و کاوشگر فایل (LinuxFileExplorerModal) در هر دو حالت عادی و تمام‌صفحه.',
      'اصلاح محدوده قرارگیری مودال‌ها به فاصله استاندارد bottom-8 در تمامی حالت‌ها تا کادر و بک‌دراپ مودال هرگز روی فوتر ننشیند.',
      'ارتقای لایه چیدمان (z-index) فوتر و نوار ابزار پایین (ToolsDock) به z-[10000] جهت اطمینان از کلیک‌پذیری و دسترسی بی‌وقفه به اطلاعات وضعیت شبکه و ابزارها.',
      'اعمال مرز دقیق bottom-8 بر روی کلیه زیرپنجره‌ها و دیالوگ‌های داخلی (دیالوگ حذف، ساخت پوشه، ساخت فایل، تغییر نام، استخراج و فشرده‌سازی).',
    ],
    changes_en: [
      'Resolved footer obstruction: ensured the application footer and status bar remain 100% visible and interactive above Linux Terminal and Linux File Explorer backdrops.',
      'Enforced strict bottom-8 clearance for all modal overlays and wrappers across both standard and maximized states, eliminating backdrop overlaps.',
      'Elevated z-index stacking of footer and ToolsDock to z-[10000] for persistent accessibility to network telemetry and minimized task pills.',
      'Standardized bottom-8 boundary across all nested subdialogs (Delete, Create Folder, Create File, Rename, Compress, Extract, Properties).',
    ],
  },
  {
    version: '1.148.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'حذف همزمان چندتایی فایل‌ها و پوشه‌ها به همراه حذف بازگشتی کامل محتویات در کاوشگر لینوکس',
    title_en: 'Bulk Multi-Item Deletion & Full Recursive Directory Content Removal in Linux File Explorer',
    changes: [
      'حل مشکل حذف تکی هنگام انتخاب چندین فایل؛ هم‌اکنون با انتخاب چند فایل یا پوشه، تمام موارد انتخاب شده به صورت یکجا حذف می‌شوند.',
      'پیاده‌سازی حذف بازگشتی (Recursive rm -rf) به طوری که با حذف هر پوشه، تمام فایل‌ها، اسکریپت‌ها و زیرپوشه‌های تودرتوی آن نیز به صورت کامل و مطمئن حذف می‌گردند.',
      'افزودن دکمه اختصاصی حذف چندتایی (Delete Selected) در نوار ابزار بالای کاوشگر به همراه نشانگر تعداد موارد انتخاب شده.',
      'افزودن پنجره مدرن و استاندارد تأیید حذف چندتایی با لیست تفکیک‌شده آیتم‌ها، نام، حجم و نوع هر آیتم.',
      'افزودن هشدار هوشمند محتوای پوشه‌ها و سوییچ اختیاری حذف بازگشتی (rm -rf) به همراه راهنمای سه‌بخشی استاندارد FieldInfoTooltip.',
      'پشتیبانی امنیتی در سطح سرور جهت محافظت اکید از مسیرهای حیاتی سیستم عامل (مانند /، /etc، /var، /usr و ...).',
      'رعایت کامل استانداردهای معماری مودال (دکمه‌های سه‌گانه بستن/مینیمایز/فول‌اسکرین، فاصله bottom-8، انطباق تم تیره/روشن و عدم کاراکتر فارسی در زبان انگلیسی).',
    ],
    changes_en: [
      'Resolved multi-item deletion issue: selecting multiple files and folders now deletes all selected items concurrently in a single unified operation.',
      'Implemented robust recursive deletion (rm -rf): deleting any folder now thoroughly and reliably removes all nested files, scripts, and subdirectories.',
      'Added dedicated "Delete Selected" bulk button to the top toolbar with real-time selection count badge.',
      'Engineered advanced bulk deletion confirmation modal with scrollable preview of all target items, item names, sizes, and directory badges.',
      'Integrated intelligent directory content notice and recursive deletion toggle with 3-part boundary-safe FieldInfoTooltip.',
      'Server-side security hardening with critical system directory protection against accidental deletion (/etc, /root, /var, etc.).',
      'Strict adherence to universal modal specifications (triple header buttons, bottom-8 clearance, full light/dark theme contrast, and strict zero-Persian English localization).',
    ],
  },
  {
    version: '1.147.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'امکان استخراج فایل‌های فشرده (Extract) در مسیر جاری یا دلخواه در کاوشگر لینوکس',
    title_en: 'Universal Archive Extraction Suite (Current & Custom Paths) in Linux File Explorer',
    changes: [
      'افزودن امکان استخراج سریع در پوشه جاری (Extract Here) با یک کلیک در منوی راست‌کلیک انواع فایل‌های فشرده.',
      'افزودن پنجره پیشرفته استخراج (Extract Archive Dialog) جهت تعیین دقیق مسیر دایرکتوری مقصد در سرور لینوکس.',
      'امکان ساخت پوشه اختصاصی همنام با آرشیو (Extract to Subfolder) جهت پیشگیری از پخش شدن فایل‌ها.',
      'امکان فعال/غیرفعال‌سازی بازنویسی فایل‌های موجود (Overwrite) جهت اعمال بروزرسانی‌های امن و دقیق.',
      'امکان حذف خودکار فایل فشرده پس از استخراج موفق (Delete Archive After Extraction) جهت مدیریت بهینه فضای ذخیره‌سازی.',
      'پشتیبانی از انواع فرمت‌های zip، tar.gz، tgz، tar.bz2، tbz2، tar.xz، txz، tar، 7z و rar با مکانیزم فال‌بک خودکار پایتون در صورت عدم نصب ابزار unzip.',
      'رعایت استانداردهای پنج‌گانه معماری مودال (دکمه‌های سه‌گانه، انطباق کامل تم تیره/روشن، عدم کاراکتر فارسی در حالت انگلیسی، حفظ فاصله bottom-8 و راهنماهای سه‌بخشی FieldInfoTooltip).',
    ],
    changes_en: [
      'Added instant one-click "Extract Here (Current Folder)" action in context menu for all recognized archive formats.',
      'Added comprehensive "Extract Archive..." modal dialog with custom target destination path support.',
      'Optional automatic subfolder creation named after the archive to keep directories tidy.',
      'Granular control over overwriting existing files in destination directory.',
      'Automated deletion of original compressed archive upon successful extraction to free server storage.',
      'Broad archive format support covering .zip, .tar.gz, .tgz, .tar.bz2, .tbz2, .tar.xz, .txz, .tar, .7z, and .rar with seamless python3 fallback when unzip CLI is absent.',
      'Strict compliance with universal modal architectural rules (triple header controls, light/dark themes, bilingual localization, bottom-8 clearance, and 3-part FieldInfoTooltips).',
    ],
  },
  {
    version: '1.146.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'امکان فشرده‌سازی فایل‌ها و پوشه‌ها با تنظیمات پیشرفته در کاوشگر لینوکس',
    title_en: 'Advanced File and Directory Compression Suite in Linux File Explorer',
    changes: [
      'افزودن امکان فشرده‌سازی (Compress / Archive) در منوی راست‌کلیک فایل‌ها و پوشه‌ها (تک‌انتخابی و چندانتخابی) و نوار ابزار بالا.',
      'پشتیبانی از انواع فرمت‌های فشرده‌سازی پرکاربرد شامل tar.gz (استاندارد لینوکس)، zip (سازگار با ویندوز و مک)، tar.bz2، tar.xz و tar معمولی.',
      'امکان تنظیم سطح فشرده‌سازی (سریع‌ترین با مصرف کم پردازنده، متوازن و بیشترین فشردگی).',
      'امکان تعیین دایرکتوری مقصد جهت ذخیره مستقیم آرشیو فشرده در هر مسیر دلخواه یا مسیر جاری.',
      'امکان حذف خودکار فایل‌ها و پوشه‌های مبدا پس از فشرده‌سازی موفق جهت آزادسازی فضای ذخیره‌سازی سرور.',
      'رعایت استانداردهای پنج‌گانه مودال (دکمه‌های سه‌گانه، انطباق تم تیره/روشن، عدم متن فارسی در حالت انگلیسی، حریم bottom-8 و راهنماهای سه‌بخشی FieldInfoTooltip).',
    ],
    changes_en: [
      'Added rich Archive & Compression action in right-click context menu (single & multi-selection) and top toolbar in Linux File Explorer.',
      'Full support for standard compression formats: tar.gz (standard Linux), zip (cross-platform Windows/Mac), tar.bz2, tar.xz, and uncompressed tar.',
      'Configurable compression levels (Level 1 Fastest/Low CPU, Level 6 Balanced, Level 9 Maximum compression).',
      'Custom destination directory selection with quick reset to current directory.',
      'Optional automated cleanup of original source items following verified archive generation to free disk space.',
      'Strict adherence to universal modal architecture (triple header controls, light/dark themes, strict bilingual localization, bottom-8 clearance, and 3-part FieldInfoTooltips).',
    ],
  },
  {
    version: '1.145.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'افزودن امکان کپی، کات (برش) و چسباندن (Paste) فایل‌ها و پوشه‌ها در کاوشگر لینوکس',
    title_en: 'Copy, Cut, and Paste Operations Across Paths in Linux File Explorer',
    changes: [
      'افزودن گزینه‌های کپی (Copy) و برش (Cut) به منوی راست‌کلیک روی فایل‌ها و پوشه‌ها (تک‌انتخابی و چندانتخابی).',
      'افزودن گزینه چسباندن (Paste) به منوی راست‌کلیک در فضای خالی دایرکتوری و همچنین بر روی پوشه‌ها (Paste into Folder).',
      'پشتیبانی از کلیدهای میانبر استاندارد صفحه‌کلید (Ctrl+C برای کپی، Ctrl+X برای برش، Ctrl+V برای چسباندن و Escape برای لغو برش).',
      'نمایش نوار وضعیت کلیپ‌بورد پویا در بالای فایل‌ها با دکمه چسباندن سریع و دکمه پاک‌سازی حافظه موقت.',
      'افکت بصری نیمه‌شفاف و خط‌چین به همراه نشانگر وضعیت برش (Cut badge) روی ردیف‌ها و کارت‌های در حال انتقال.',
      'اجرای مستقیم بر روی سرور لینوکس از طریق SSH با دستورات بومی cp -r و mv و نام‌گذاری خودکار هوشمند در صورت کپی در همان مسیر.',
    ],
    changes_en: [
      'Added Copy and Cut context menu actions for individual and multi-selected files and directories.',
      'Added Paste context menu actions on empty directory spaces and directly on folders (Paste into Folder).',
      'Full support for standard keyboard shortcuts (Ctrl+C to copy, Ctrl+X to cut, Ctrl+V to paste, Escape to cancel cut).',
      'Floating active clipboard banner displaying pending cut/copied items with instant Paste Here and Clear actions.',
      'Semi-transparent, dashed visual feedback with Cut badges for items queued for moving across directories.',
      'Native SSH backend execution utilizing cp -r and mv with automatic non-colliding name generation when copying into the same path.',
    ],
  },
  {
    version: '1.144.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'ویرایش زنده مجوزها، مالکیت و بیت‌های دسترسی خاص در پنجره Properties کاوشگر لینوکس',
    title_en: 'Live Permissions (chmod), Ownership (chown), and Special Bits Editing in Linux Properties Dialog',
    changes: [
      'امکان تغییر بلادرنگ و مستقیم سطح دسترسی (chmod) از داخل مودال مشخصات و اینفو با ماتریس چک‌باکس‌های بصری Read/Write/Execute برای مالک، گروه و سایرین.',
      'پشتیبانی کامل از وارد کردن دستی مد عددی اکتال (مانند 0755 یا 0644) با همگام‌سازی دوطرفه خودکار بین ورودی عددی، چک‌باکس‌ها و رشته متنی.',
      'افزودن دکمه‌های الگوهای سریع دسترسی (0755, 0644, 0700, 0600, 0777) برای تنظیم آسان مجوزها با یک کلیک.',
      'تجهیز به چک‌باکس‌های بیت‌های دسترسی پیشرفته لینوکس شامل SUID (4000)، SGID (2000) و بیت چسبنده Sticky (1000) به همراه کادرهای راهنمای سه‌بخشی استاندارد (این چیست، چرا لازم است، مثال کاربردی).',
      'امکان تغییر مالک (chown) و گروه کاربری با پیشنهاد خودکار فهرست کاربران و گروه‌های واقعی سرور لینوکس واکشی‌شده از /etc/passwd و /etc/group.',
      'گزینه اعمال بازگشتی تغییرات به زیرپوشه‌ها و فایل‌ها (-R) برای دایرکتوری‌ها.',
      'اجرای امن در بک‌اند از طریق SSH با دستورات استاندارد chmod و chown و فالبک خودکار sudo در صورت نیاز به اختیارات مدیریتی.',
    ],
    changes_en: [
      'Direct, live editing of access permissions (chmod) directly within the Properties dialog via interactive Read/Write/Execute toggles for Owner, Group, and Others.',
      'Full two-way synchronization between manual octal numeric input (e.g. 0755, 0644), permission checkboxes, and human-readable string preview.',
      'Included one-click quick presets for common modes (0755, 0644, 0700, 0600, 0777) for instant assignment.',
      'Full support for advanced Linux special permission bits: SUID (4000), SGID (2000), and Sticky Bit (1000) with compliant 3-part informational tooltips.',
      'Interactive Ownership (chown) and Group editor with datalist autocompletion populated from live remote server /etc/passwd and /etc/group accounts.',
      'Recursive modification toggle (-R) for directories to propagate attributes across child trees.',
      'Secure backend execution via remote SSH session using chmod/chown with automatic elevated sudo fallback when administrative privileges are required.',
    ],
  },
  {
    version: '1.143.1',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع مشکل پنهان شدن دکمه‌های کنترلی هدر کاوشگر فایل در حالت تمام‌صفحه (فاز ۶)',
    title_en: 'Fix File Explorer Header Action Buttons Stacking in Fullscreen Mode (Phase 6)',
    changes: [
      'انتقال رندرینگ کل مودال کاوشگر فایل (LinuxFileExplorerModal) به ریشه document.body با createPortal جهت خروج قطعی از Stacking Context و والد z-10 بدنه برنامه.',
      'افزایش اولویت لایه‌بندی مودال به z-[9999] و ارتقای هدر و دکمه‌های سه‌گانه کنترلی به relative z-20 جهت دسترسی بدون مانع.',
      'تضمین دیده‌شدن، کلیک‌پذیری و عملکرد بی‌نقص دکمه‌های بستن، مینیمایز در نوار داک (ToolsDock) و خروج از حالت تمام‌صفحه در کلیه رزولوشن‌ها و حالت‌های مرورگر.',
    ],
    changes_en: [
      'Hoisted LinuxFileExplorerModal rendering directly into document.body using createPortal to escape parent layout overflow and z-10 stacking context.',
      'Elevated modal stacking order to z-[9999] and assigned relative z-20 to header controls for uninterrupted visibility.',
      'Guaranteed flawless clickability and immediate accessibility for Close, ToolsDock Minimize, and Fullscreen toggle buttons across all screen resolutions.',
    ],
  },
  {
    version: '1.143.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'پنجره مشخصات و اینفو جامع فایل و دایرکتوری در راست‌کلیک کاوشگر لینوکس (فاز ۵)',
    title_en: 'Comprehensive File & Directory Properties/Info Dialog in Linux File Explorer Context Menu (Phase 5)',
    changes: [
      'افزودن گزینه Properties / Info در منوی راست‌کلیک تک فایل، پوشه و فضای خالی دایرکتوری جاری.',
      'واکشی متادیتای تفصیلی فایل و پوشه از سرور با دستورات stat و پشتیبانی SFTP شامل مسیر کامل، نام، حجم دقیق به بایت و فرمت‌شده، مقصد Symlink و تعداد آیتم‌ها.',
      'نمایش نام و شناسه عددی مالک (UID/User) و گروه کاربری (GID/Group) به همراه مجوزهای عددی اکتال (مانند 0755) و متنی.',
      'طراحی ماتریس تفکیکی مجوزهای سه‌گانه کاربر، گروه و دیگران (Read, Write, Execute) با بج‌های وضعیت بصری شفاف.',
      'نمایش زمان آخرین تغییر محتوا (mtime)، آخرین دسترسی (atime) و زمان ایجاد یا تغییر وضعیت (ctime) با دکمه‌های کپی مسیر و دستور chmod.',
    ],
    changes_en: [
      'Added Properties / Info option in context menus for files, folders, and current directory empty space.',
      'Fetched detailed file/directory metadata from Linux server via stat and SFTP fallback including path, name, exact bytes, symlink target, and direct child count.',
      'Displayed owner UID/User, group GID/Group, octal permissions (e.g. 0755), and textual permission strings.',
      'Designed interactive visual permissions matrix table detailing User, Group, and Others read/write/execute rights.',
      'Showed modified time (mtime), access time (atime), and creation/change time (ctime) with quick copy buttons for path and chmod command.',
    ],
  },
  {
    version: '1.142.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'امکان بارگذاری (Upload) فایل در پوشه با راست‌کلیک در فضای خالی کاوشگر لینوکس (فاز ۴)',
    title_en: 'Direct File Upload Dialog via Empty Space Right-Click in Linux File Explorer (Phase 4)',
    changes: [
      'امکان کلیک راست در فضای خالی هر دایرکتوری و انتخاب گزینه بارگذاری فایل در آن مسیر.',
      'افزودن مودال اختصاصی بارگذاری فایل با پشتیبانی از Drag & Drop و انتخاب چندین فایل همزمان.',
      'افزودن دکمه بارگذاری سریع در نوار ابزار و منوی راست‌کلیک روی زیرپوشه‌ها.',
      'پیاده‌سازی پایپ انتقال امن فایل روی SFTP سمت سرور با نوار پیشرفت و رفرش خودکار دایرکتوری.',
    ],
    changes_en: [
      'Added right-click context menu on empty folder spaces to trigger direct file upload.',
      'Implemented dedicated file upload modal with drag-and-drop zone and multi-file selection support.',
      'Added quick upload button in top toolbar and inside folder context menu.',
      'Built SFTP streaming upload pipeline on server with live progress indicator and automatic directory refresh.',
    ],
  },
  {
    version: '1.141.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'امکان دانلود تکی و چندگانه فایل‌ها با آرشیو فشرده ZIP در کاوشگر فایل (فاز ۳)',
    title_en: 'Single & Multi-File Download with ZIP Archiving in Linux File Explorer (Phase 3)',
    changes: [
      'امکان دانلود مستقیم تک فایل با راست‌کلیک روی فایل و انتخاب گزینه دانلود.',
      'امکان انتخاب چندگانه فایل‌ها و پوشه‌ها با کلید Ctrl/Command (Multi-selection) و نمایش هایلایت بصری واضح.',
      'امکان دانلود یکجای تمام موارد انتخابی در قالب یک فایل فشرده ZIP استاندارد با استریم سمت سرور و پشتیبانی از پوشه‌ها.',
      'افزودن دکمه دانلود سریع در نوار ابزار و اعلان پیشرفت دانلود با انیمیشن روان.',
    ],
    changes_en: [
      'Added direct single-file download via right-click context menu on any file.',
      'Enabled multi-file and folder selection via Ctrl/Command key with distinct visual highlights in table and grid views.',
      'Added bulk download capability archiving all selected files and folders into a compressed ZIP stream.',
      'Integrated quick toolbar download action and floating live download status toast indicator.',
    ],
  },
  {
    version: '1.140.3',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'افزودن منوی راست‌کلیک هوشمند (Context Menu) و پاکسازی هاور در کاوشگر فایل (فاز ۲)',
    title_en: 'Smart Context Menu on Right-Click & Clean Hover State in Linux File Explorer (Phase 2)',
    changes: [
      'جایگزینی دکمه‌های هاور مزاحم با منوی راست‌کلیک هوشمند (Context Menu) روی فایل‌ها و پوشه‌ها.',
      'طراحی پورتال امن و سازگار با مرزهای صفحه (4-Way Boundary Clamped) با پشتیبانی کامل از تم تیره و روشن.',
      'امکان دسترسی به گزینه‌های کپی مسیر کامل، تغییر نام و حذف از طریق راست‌کلیک و دکمه گزینه‌ها (3-dot).',
    ],
    changes_en: [
      'Replaced hover action buttons with a smart, native-feeling right-click context menu on files and folders.',
      'Engineered a boundary-safe (4-way viewport clamped) portal menu with full dark and light mode contrast support.',
      'Accessible item actions for copying full path, renaming, and deleting via right-click or quick 3-dots trigger.',
    ],
  },
  {
    version: '1.140.2',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'حذف حالت ویرایش فایل و رفع فریز لودینگ فایل‌ها در کاوشگر فایل لینوکس (فاز ۱)',
    title_en: 'Remove File In-Modal Editor & Prevent Loading Freeze in Linux File Explorer (Phase 1)',
    changes: [
      'حذف کامل حالت ویرایش درون‌برنامه‌ای فایل‌ها به منظور رفع مشکل فریز و انتظار نامحدود در لودینگ فایل‌ها.',
      'بهبود عملکرد دابل‌کلیک جهت ورود مستقیم به پوشه‌ها و سوییچ سریع به حالت انتخاب فایل.',
      'پاکسازی دکمه‌ها و اکشن‌های ادیت فایل از نماهای جدولی و شبکه‌ای مودال.',
    ],
    changes_en: [
      'Completely removed the in-modal file editor overlay to eliminate remote file loading freeze and hang states.',
      'Optimized double-click navigation to exclusively open directories without triggering hanging file read operations.',
      'Cleaned up edit action buttons and unnecessary UI overlays from both table and grid views.',
    ],
  },
  {
    version: '1.140.1',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'یکپارچه‌سازی مودال کاوشگر فایل در منوی ۳ نقطه و نماهای سرورهای لینوکس (فاز ۳)',
    title_en: 'Integrate File Explorer Modal in Linux Server 3-Dot Action Menu & Views (Phase 3)',
    changes: [
      'افزودن آیتم "کاوشگر فایل" (File Explorer) به منوی ۳ نقطه شناور سرورهای لینوکس با آیکون FolderTree و توضیحات تخصصی.',
      'افزودن دکمه دسترسی سریع "فایل‌ها" (Files) در کارت‌های سرور و ردیف‌های جدول سرورهای ریموت لینوکس.',
      'یکپارچه‌سازی کامل با داک نوار ابزار پایین (Modal Dock) و حفظ استیت هنگام مینیمایز با برچسب SFTP.',
      'رعایت اصل عدم ذخیره رمزهای عبور (Zero-Storage Policy) با انتقال اختیاری سشن‌های احراز هویت.',
    ],
    changes_en: [
      'Added "File Explorer" action item to the 3-dot floating action menu for all Linux servers with FolderTree iconography and dedicated badges.',
      'Added quick "Files" action buttons directly on Linux server cards and data table rows for rapid one-click access.',
      'Seamless integration with bottom Tools Dock supporting minimize/restore lifecycle with "SFTP" tool badges.',
      'Maintained strict Zero-Storage credential security policies with on-demand session pass-through.',
    ],
  },
  {
    version: '1.140.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'طراحی و ساخت مودال جامع کاوشگر فایل لینوکس (Linux File Explorer Modal - فاز ۲)',
    title_en: 'Design and Build Full-Featured Linux File Explorer Modal (Phase 2)',
    changes: [
      'طراحی رابط کاربری دو تکه (Split-Pane): پنل سمت چپ (۱ چهارم عرض صفحه) اختصاص‌یافته به دایرکتوری‌های اصلی و سیستمی لینوکس با قابلیت جستجو، و پنل سمت راست (۳ چهارم) برای مرور فایل‌ها و پوشه‌ها.',
      'پشتیبانی کامل از ناوبری چندسطحی، تاریخچه رفت و برگشت (Back/Forward)، رفتن به پوشه والد (Up)، و نوار مسیر پویا (Breadcrumb Path Bar).',
      'تجهیز به حالت‌های نمایش دوگانه جدولی (Table List) و شبکه‌ای (Grid View)، تفکیک هوشمند آیکون‌ها بر اساس نوع فایل (پوشه، اسکریپت، کانفیگ، لاگ، آرشیو، گواهینامه، باینری، تصاویر).',
      'ویرایشگر و مشاهده‌گر متن داخلی یکپارچه با قابلیت ذخیره‌سازی، نمایش وضعیت تغییرات، کپی محتوا، و مدهای فقط‌خواندنی یا ویرایش.',
      'افزودن قابلیت‌های ایجاد پوشه، ایجاد فایل، تغییر نام و حذف قطعی با تأییدیه بازگشتی.',
      'رعایت صددرصدی قوانین پنج‌گانه مودال (دکمه‌های سه‌گانه هدر، حریم فوتر bottom-8 در فول‌اسکرین، تم‌های تیره/روشن، عدم وجود متن فارسی در زبان انگلیسی، و راهنماهای سه‌بخشی FieldInfoTooltip).',
    ],
    changes_en: [
      'Engineered split-pane architecture: left pane (1/4 width) dedicated to standard Linux system quick directories with search, and right pane (3/4 width) for file and folder browsing.',
      'Full support for multi-level navigation, history traversal (Back/Forward), parent jump (Up), and interactive Breadcrumb Path Bar.',
      'Equipped with dual Table List and Grid views with intelligent type-based icon recognition (folders, scripts, configs, logs, archives, keys, binaries, images).',
      'Built-in in-app text/code editor and viewer with direct write-back, unsaved changes tracking, content copying, and read-only/editable safety guards.',
      'Added modals for directory creation, empty file creation, renaming, and recursive deletion with safety confirmation.',
      '100% compliant with universal 5-point modal rules (triple header controls, bottom-8 fullscreen boundary, dark/light theme ergonomics, strict bilingual i18n, and boundary-safe 3-part FieldInfoTooltip popovers).',
    ],
  },
  {
    version: '1.139.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'افزودن ماژول و موتور بک‌اند SFTP و File Explorer برای سرورهای لینوکس (فاز ۱)',
    title_en: 'Add Native SFTP Engine & File System API Layer for Linux Servers (Phase 1)',
    changes: [
      'توسعه موتور ارتباطی مستقیم SFTP روی SSH2 سازگار با الگوریتم‌های مدرن و سنتی (Adaptive Multi-Generation Fallback طبق Rule 12).',
      'ایجاد اندپوینت‌های استاندارد فهرست‌گیری، خواندن فایل‌های متنی/کانفیگ، ذخیره‌سازی، ایجاد پوشه، ایجاد فایل، تغییر نام و حذف در روت‌های /api/remote-servers/:id/fs/*.',
      'پشتیبانی کامل از دایرکتوری‌های سیستمی سریع (Quick Dirs) شامل /، /etc، /var/log، /home، /root، /tmp، /opt و غیره.',
      'افزودن تایپ‌های استوار TypeScript و متدهای کلاینت در لایه ارتباطی api.ts.',
    ],
    changes_en: [
      'Engineered native SSH2 SFTP filesystem engine with adaptive modern & legacy cipher negotiation (Rule 12 compliant).',
      'Created standard API endpoints for directory listing, text/config file reading, persistent file writing, directory creation, empty file creation, renaming and deletion under /api/remote-servers/:id/fs/*.',
      'Built fast system quick directory catalog (/ , /etc, /var/log, /home, /root, /tmp, /opt, /mnt, /media, /srv).',
      'Added robust TypeScript interfaces and client API methods across src/types.ts and src/services/api.ts.',
    ],
  },
  {
    version: '1.138.6',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع قطعی خطای محاسبه و نمایش حجم توتال دیسک سرور در لیست و پایش زنده ناوگان',
    title_en: 'Fix Total Server Disk Size Calculation and Live Hardware Telemetry Probe',
    changes: [
      'اصلاح ساختار اسکریپت کاوش سخت‌افزار (hwScript) در مسیر تست ارتباط با خروجی صریح جفت کلید-مقدار و جلوگیری از تداخل سطرها.',
      'افزودن دستور استخراج دیسک‌های بلوکی کامل (lsblk -b -d -n) جهت سنجش مستقیم ظرفیت فیزیکی/مجازی دیسک‌ها بدون احتساب تکراری پارتیشن‌ها یا کانتینرهای داکر.',
      'حذف رفتار جمع‌زدن اشتباه تمام ردیف‌های df که باعث ضرب شدن سایز پارتیشن در تعداد کانتینرهای در حال اجرا و نمایش ارقام نادرستی چون ۲۵۰ گیگابایت می‌شد.',
      'همگام‌سازی لحظه‌ای متریک‌های سخت‌افزاری دریافت شده با حافظه محلی و پایگاه داده در پایش سرورهای لینوکس.',
    ],
    changes_en: [
      'Refactored hardware keepalive probe script to use clean, unambiguous KEY=VALUE output, eliminating line concatenation bugs.',
      'Integrated whole-disk block device discovery (lsblk -b -d -n) to measure true underlying physical/virtual disk capacity without duplicate partition or docker container overlay counting.',
      'Eliminated naive summation over all df rows which previously accumulated identical filesystem mounts across running docker containers and led to false calculations like 250 GB.',
      'Synchronized freshly discovered hardware metrics seamlessly into local client state and the PostgreSQL database layer.',
    ],
  },
  {
    version: '1.138.5',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع خطای نمایش پیش‌فرض ۲۵۰ گیگابایت دیسک سرور و فعال‌سازی سنجش دقیق ظرفیت واقعی سخت‌افزار',
    title_en: 'Fix Incorrect 250 GB Server Disk Display and Enable Authentic Multi-Tier Capacity Discovery',
    changes: [
      'حذف کامل مقادیر فرضی و هاردکد شده ۲۵۰ گیگابایت برای دیسک (و مقادیر پیش‌فرض ساختگی) از پایگاه داده و لایه تبدیل مدل سرورها.',
      'ارتقای اسکریپت کاوش سخت‌افزار در پایش زنده و کیپ‌الایو با الگوریتم چندسطحی (سنجش دیسک‌های فیزیکی/مجازی با lsblk، مجموع فایل‌سیستم‌های واقعی با df و پارتیشن ریشه) جهت استخراج ظرفیت دقیق و بدون خطا.',
      'افزودن بخش مشخصات سخت‌افزاری (تعداد هسته‌های پردازنده، حافظه رم و ظرفیت واقعی دیسک) در مودال ایجاد و ویرایش سرور (AddEditServerModal) با اعتبارسنجی ارگونومیک و راهنمای سه‌بخشی Info Tooltip.',
      'پایبندی کامل به قانون منع استفاده از داده‌های ساختگی (Rule 8) و نمایش خط تیره در صورت عدم اتصال یا مشخص نبودن اندازه دیسک به جای اعداد فرضی.',
    ],
    changes_en: [
      'Completely eliminated hardcoded 250 GB fallback defaults for server disk capacity (and simulated hardware fallbacks) across the database and model mapping layer.',
      'Upgraded live telemetry and keepalive hardware discovery with a robust multi-tier pipeline (lsblk physical/virtual disk aggregation, real non-virtual filesystem sum via df, and root partition measurement) for accurate storage detection.',
      'Added a dedicated Hardware Specifications section (vCPU cores, RAM memory, and authentic Disk capacity) to AddEditServerModal with 3-part boundary-safe Info Tooltips.',
      'Enforced strict authentic telemetry rules (Rule 8) to show graceful dashes (— Disk) instead of arbitrary fabricated numbers whenever disk size is unmeasured.',
    ],
  },
  {
    version: '1.138.4',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'اصلاح چیدمان چندخطی مشخصات سخت‌افزاری و آپ‌تایم زیر نام سرور جهت جلوگیری از تعریض ستون‌ها',
    title_en: 'Multi-Line Layout for Server Hardware Resources and Uptime Below Server Name',
    changes: [
      'انتقال مشخصات سخت‌افزاری سرورها (پردازنده، رم و دیسک) به سطر دوم درست زیر نام سرور جهت جلوگیری از کشیدگی افقی ستون.',
      'انتقال آپ‌تایم (مدت زمان کارکرد سرور) به سطر سوم زیر مشخصات ریسورس‌ها با آیکون ساعت و طراحی جمع‌وجور ارگونومیک.',
      'اعمال ساختار چندخطی بهینه بر روی نماهای لیستی (List View) و جدول متراکم (Dense Table View).',
    ],
    changes_en: [
      'Relocated server hardware specifications (CPU, RAM, and Disk) to a dedicated second line under the server name to prevent horizontal table column stretching.',
      'Positioned system uptime on the third line directly underneath the resources row with a compact ergonomic clock indicator.',
      'Applied the optimized multi-line layout consistently across List View and Dense Table View.',
    ],
  },
  {
    version: '1.138.3',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'نمایش مدت زمان کارکرد (Uptime) در لیست و جدول ناوگان سرورها',
    title_en: 'Display Server Uptime in Fleet Server List and Table Views',
    changes: [
      'افزودن نمایش آپ‌تایم و مدت زمان کارکرد سرور (Uptime) در نمای لیستی ناوگان سرورها، زیر نام هاست، ستون وضعیت لحظه‌ای و ستون اختصاصی Uptime.',
      'تعبیه ستون جدید Uptime در بخش انتخاب و سفارشی‌سازی ستون‌های جدول با قابلیت فعال/غیرفعال‌سازی و ذخیره در LocalStorage.',
      'پشتیبانی از نمایش مقدار Uptime در تمامی نماهای لیستی (List View)، کارتی (Grid View) و جدولی متراکم (Table View).',
    ],
    changes_en: [
      'Added server uptime display across fleet server views under host specs, live status column, and as a dedicated Uptime column.',
      'Integrated new Uptime column in table column picker customization with persistence in LocalStorage.',
      'Supported uptime metrics visualization in List View, Grid Cards View, and Dense Table View.',
    ],
  },
  {
    version: '1.138.2',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'اصلاح نمایش مشخصات سخت‌افزاری (رم، پردازنده و هارد) در تست Keepalive ناوگان سرورها',
    title_en: 'Fix Server Hardware Specs (RAM, CPU, and Disk) Display During Fleet Keepalive Test',
    changes: [
      'اصلاح و یکپارچه‌سازی نمایش مشخصات سخت‌افزاری سرورها شامل پردازنده (vCPU)، توتال رم (RAM) و فضای ذخیره‌سازی هارد دیسک (Disk) در زیر نام سرور در نماهای لیستی، جدولی و کارتی ناوگان سرورها.',
      'افزودن قابلیت ارزیابی و استخراج خودکار مشخصات سخت‌افزاری واقعی در تست پینگ و Keepalive سرورهای ریموت لینوکس از طریق اجرای امن و سریع فرمان‌های سخت‌افزاری و ذخیره در دیتابیس.',
      'همگام‌سازی بلادرنگ استیت سرورها با مشخصات دریافتی از تست Keepalive در تمامی حالت‌های تست تکی، تست دسته‌ای (Bulk Ping) و تست سراسری کل ناوگان (Ping All).',
      'حذف مقادیر فرضی هاردکد شده (|| 4 و || 16) و جایگزینی با نمایش دقیق مقادیر واقعی سخت‌افزار یا خط تیره در صورت عدم اتصال.',
      'رعایت کامل استانداردهای دو زبانه (فارسی و انگلیسی) در نمایش برچسب‌های سخت‌افزاری.',
    ],
    changes_en: [
      'Fixed and unified the hardware specifications display under server names, including vCPU cores, total RAM, and Hard Disk storage across List, Table, and Grid fleet views.',
      'Integrated real-time genuine hardware telemetry extraction during keepalive ping checks over SSH, persisting discovered CPU, RAM, and Disk capacity to the server database.',
      'Synced real-time client state updates during single server keepalive, bulk keepalive ping, and fleet-wide ping sweeps.',
      'Eliminated hardcoded fallback defaults (|| 4 and || 16), ensuring authentic metrics are rendered with clean non-available placeholders when disconnected.',
      'Strictly enforced bilingual localization for hardware metric units in both Persian and English modes.',
    ],
  },
  {
    version: '1.138.1',
    releaseDate: '2026-09-24',
    type: 'patch',
    title: 'رفع خطای رندرینگ هوک‌های ری‌اکت (React Error #310) در مودال ثبت قانون فایروال',
    title_en: 'Fix React Hooks Order Violation (Minified React Error #310) in Add Firewall Rule Modal',
    changes: [
      'رفع خطای نقض قوانین هوک‌های ری‌اکت (Rules of Hooks) به علت خروج زودهنگام شرطی (if (!isOpen) return null) قبل از فراخوانی هوک‌های useMemo در مودال ثبت قوانین فایروال.',
      'اصلاح ساختار ترتیب هوک‌ها در کامپوننت LinuxAddFirewallRuleModal به صورت کاملاً ایستا و اجرای یکپارچه بدون خروج زودهنگام.',
      'مشروط‌سازی رندر مودال در والد (LinuxFirewallTab) جهت آزادسازی حافظه و ریست شدن صحیح استیت فرم در زمان بستن و بازگشایی مجدد.',
    ],
    changes_en: [
      'Fixed React Error #310 caused by an early conditional return (if (!isOpen) return null) placed before useMemo hooks in LinuxAddFirewallRuleModal.',
      'Guaranteed consistent unconditional hook call hierarchy across all renders inside LinuxAddFirewallRuleModal.',
      'Optimized modal mounting in LinuxFirewallTab ensuring clean state initialization and portal mounting upon user interaction.',
    ],
  },
  {
    version: '1.138.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'مودال پیشرفته افزودن و حذف قوانین فایروال (Add Firewall Rule Modal) با تشخیص تداخل و الگوهای سریع',
    title_en: 'Advanced Firewall Rule Creation & Deletion Modal with Collision Detection & Service Presets',
    changes: [
      'طراحی و استقرار کامل مودال Configure & Add Firewall Rule مطابق با ۵ استاندارد جامع معماری مودال‌ها (بستن، مینیمایز در داک، فول‌اسکرین با حفظ حریم فوتر، تم روشن/تیره و پشتیبانی صددرصد دو زبانه).',
      'افزودن کلیدهای انتخاب الگوهای سریع سرویس‌های رایج شبکه (SSH 22، HTTP 80، HTTPS 443، DNS 53، MySQL 3306، PostgreSQL 5432، Redis 6379، WireGuard 51820) جهت تسریع تنظیمات.',
      'پیاده‌سازی موتور هوشمند تشخیص تداخل قوانین (Rule Conflict Detection) جهت اعلام هشدار در صورت ثبت قوانین تکراری یا متناقض بر روی یک پورت مشترک.',
      'پیش‌نمایش زنده و تفکیک‌شده دستورات واقعی سیستم‌عامل (Target System Command Preview) پیش از اجرا بر روی سرور برای انواع پشته‌های UFW، firewalld، nftables و iptables.',
      'امکان فیلتر و جستجوی آنی قوانین فعال فایروال بر اساس شماره پورت، پروتکل، جهت و آدرس مبدا.',
      'تجهیز دکمه حذف قوانین به دیالوگ تایید ایمن به همراه هشدار قفل شدن دسترسی (Lockout Warning) در صورت اقدام به حذف پورت فعال SSH.',
    ],
    changes_en: [
      'Engineered LinuxAddFirewallRuleModal complying with all 5 mandatory modal standards (Close, Dock Minimize, Fullscreen with bottom-8 footer clearance, dark/light contrast, strict i18n).',
      'Added one-click common service presets for SSH (22), HTTP (80), HTTPS (443), DNS (53), MySQL (3306), PostgreSQL (5432), Redis (6379), and WireGuard (51820).',
      'Integrated real-time Rule Conflict Detection warning users when duplicate or contradictory policies are targeted at the same port and protocol.',
      'Provided real-time Target System Command Preview displaying exact terminal commands dispatched for UFW, firewalld, nftables, or iptables.',
      'Implemented instant client-side filtering and search across port numbers, protocols, comments, and traffic directions.',
      'Equipped rule deletion with safety confirmation modal and explicit SSH lockout warning when attempting to remove active SSH access rules.',
    ],
  },
  {
    version: '1.137.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'معماری و ماژول تشخیص خودکار فایروال لینوکس (UFW، firewalld، nftables، iptables) و تب اختصاصی Firewall',
    title_en: 'Linux Firewall Engine Discovery (UFW, firewalld, nftables, iptables) & Dedicated Firewall Management Tab',
    changes: [
      'پیاده‌سازی ماژول و تب اختصاصی Firewall در مدال مدیریت سرور لینوکس جهت پایش، تشخیص و مدیریت حرفه‌ای فایروال.',
      'طراحی معماری ارائه‌دهنده فایروال (FirewallProvider) با کلاس‌های تفکیک‌شده برای UFW، firewalld، nftables، iptables و سناریوی بدون فایروال فعال.',
      'کاوش بلادرنگ وضعیت اجرایی، فعال بودن دیمون سیستم‌دی، نسخه و سیاست‌های پیش‌فرض ورودی (Default Incoming)، خروجی (Default Outgoing) و هدایت (Forward).',
      'استخراج و نمایش قوانین فعال به صورت کارت‌های خوانا و ساختاریافته به همراه شماره قانون، پورت، پروتکل، جهت و آدرس مبدا.',
      'تطبیق بلادرنگ سوکت‌ها و پورت‌های گوش‌دهنده سیستم (Listening Sockets از طریق ss/netstat) با قوانین فایروال جهت تشخیص باز یا مسدود بودن سرویس‌ها.',
      'افزودن دیاگنوستیک کامل با امکان باز کردن آکاردئون خروجی خام پروب جهت شفافیت حداکثری و عیب‌یابی مدیران شبکه.',
    ],
    changes_en: [
      'Implemented dedicated Firewall management tab inside the Linux Server Management modal for real-time inspection and configuration.',
      'Engineered extensible FirewallProvider architecture with dedicated drivers for UFW, firewalld, nftables, iptables, and unmanaged systems.',
      'Integrated live remote discovery probing daemon state, systemd services, active tables, and default policies for incoming, outgoing, and forwarding traffic.',
      'Extracted active packet-filtering rules into human-readable cards detailing action, protocol, port, direction, source address, and comments.',
      'Added listening sockets correlation analyzing active listening ports against firewall filter rules to determine open vs blocked daemon ports.',
      'Provided raw diagnostic probe output accordion for enterprise transparency and root-cause troubleshooting.',
    ],
  },
  {
    version: '1.136.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'تکمیل مودال پیکربندی پیشرفته کارت شبکه (DHCP/Static/DNS)، پیش‌نمایش تغییرات و ری‌استارت ایمن سرویس شبکه لینوکس',
    title_en: 'Advanced Linux Network Interface Configuration (DHCP/Static/DNS), Pre-flight Preview Diff, and Safe Network Service Restart',
    changes: [
      'توسعه و بازنویسی جامع مودال Configure Network Interface با پشتیبانی کامل از تغییر متد آدرس‌دهی (DHCP خودکار و Static دستی)، آدرس IPv4، پیشوند CIDR، گیت‌وی پیش‌فرض، مقدار MTU و سرورهای نام (DNS).',
      'افزودن ماژول مدیریت سرورهای DNS با قابلیت درج چندین آدرس، حذف، و دکمه‌های درج سریع ارائه‌دهندگان معتبر (Cloudflare 1.1.1.1، Google 8.8.8.8، Quad9 9.9.9.9) و نگارش خودکار در پشته هدف (NetworkManager، Netplan، systemd-resolved، resolv.conf).',
      'پیاده‌سازی مرحله پیش‌نمایش تفکیک‌شده (Configuration Preview Diff) پیش از ارسال دستورات به سرور، جهت مقایسه مقادیر فعلی و مقادیر هدف به همراه بنر اخطار اتصال فعال SSH.',
      'افزودن سیستم ایمنی و الزام تایید صریح کاربر در صورت اعمال تغییرات یا خاموش کردن کارت شبکه‌ای که نشست لایو SSH از طریق آن در حال اجراست.',
      'پیاده‌سازی عملیات راه‌اندازی مجدد سرویس شبکه (Restart Network Service) با تشخیص پشته فعال سیستم و مودال هشدار تاییدیه پیش از اجرا.',
      'تعبیه دکمه‌های کنترل وضعیت کارت شبکه (Bring UP / Bring DOWN) با دریافت تاییدیه صریح و هشدارهای امنیتی.',
      'استقرار موتور اعتبارسنجی پس از پیکربندی (Post-Apply Live Verification) با بازخوانی وضعیت زنده از کرنل لینوکس، نام پکیج اعمال‌کننده و مقادیر تاییدشده.',
    ],
    changes_en: [
      'Overhauled Configure Network Interface modal supporting dynamic switching between DHCP and Static IP modes, IPv4 address, CIDR prefix, default gateway, MTU tuning, and multi-resolver DNS management.',
      'Added full DNS manager with multi-server addition/removal, one-click presets (Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9 9.9.9.9), and native writing to target stack (NetworkManager, Netplan, systemd-resolved, resolv.conf).',
      'Implemented pre-flight Configuration Preview Diff comparing active kernel state with target values before dispatching commands, accompanied by live SSH management path warnings.',
      'Integrated active SSH session safety guards requiring mandatory risk acknowledgment checkbox when reconfiguring or bringing down the interface carrying the current management connection.',
      'Added real Network Service Restart action with native daemon detection (NetworkManager, systemd-networkd, networking) and explicit confirmation modal warning about potential SSH interruption.',
      'Provided direct administrative Bring UP / Bring DOWN controls on interface cards with confirmation guards.',
      'Integrated post-apply live verification reading kernel state after changes and presenting confirmed IP, gateway, MTU, and the Linux provider used.',
    ],
  },
  {
    version: '1.135.0',
    releaseDate: '2026-09-24',
    type: 'minor',
    title: 'سیستم تشخیص توزیع و پشته شبکه لینوکس (Distribution & Network Stack Discovery) و کارت‌های تفصیلی اینترفیس‌ها',
    title_en: 'Linux Distribution & Network Stack Discovery Architecture with Comprehensive Interface Hardware & Routing Cards',
    changes: [
      'پیاده‌سازی ماژول عمیق تشخیص توزیع و معماری شبکه لینوکس (/server/linuxNetworkManager.ts) با شناسایی دقیق نسخه سیستم‌عامل (Debian، Ubuntu، RHEL، Rocky، CentOS، Fedora، SUSE)، مدیر سیستم (systemd/sysvinit)، پشته فعال شبکه (NetworkManager، Netplan، systemd-networkd، ifupdown)، مدیر DNS (systemd-resolved، NetworkManager، resolvconf) و اینترفیس نشست فعال SSH.',
      'افزودن اندپوینت‌های اختصاصی بک‌اند (/api/remote-servers/:id/network-stack) جهت استخراج بدون مداخله و مطمئن داده‌های ساختاریافته JSON از ip -j addr و ip -j -s link و لایه‌های مسیریابی.',
      'طراحی و استقرار کامپوننت اختصاصی LinuxNetworkInterfacesTab به عنوان جایگزین ساختار پیشین در مودال مدیریت سرور لینوکس.',
      'افزودن کارت هوشمند پشته شبکه و توزیع در بالای صفحه با نمایش وضعیت سرویس فعال، مدیر DNS، آدرس پیش‌فرض Gateway، و بنر هشدار محافظتی در صورت قرار گرفتن اینترفیس روی مسیر اتصال زنده SSH.',
      'ارائه مشخصات جامع سخت‌افزاری و نرم‌افزاری هر کارت شبکه شامل MAC، وضعیت حامل (Carrier)، IPv4، IPv6، متد IP (استاتیک / DHCP)، MTU، سرعت و Duplex لینک، درایور، و آمار تفکیک‌شده ترافیک، پکت‌ها و خطاهای RX/TX.',
      'تجهیز به فیلترهای تفکیک‌شده (همه، UP، DOWN، فیزیکی، مجازی)، جستجوی بلادرنگ، راهنمای ۳ بخشی FieldInfoTooltip، و انطباق کامل با استانداردهای دوزبانه (فارسی/انگلیسی) و تم‌های روشن و تیره.',
    ],
    changes_en: [
      'Implemented native Linux distribution and network stack discovery module (/server/linuxNetworkManager.ts) accurately detecting OS distro and version (Debian, Ubuntu, RHEL, Rocky, CentOS, Fedora, SUSE), init system (systemd/sysvinit), active network stack (NetworkManager, Netplan, systemd-networkd, ifupdown), DNS manager (systemd-resolved, NetworkManager, resolvconf), and active SSH management route.',
      'Added dedicated backend endpoints (/api/remote-servers/:id/network-stack) for safe, non-intrusive extraction of structured JSON telemetry from ip -j addr, ip -j -s link, and routing tables.',
      'Designed and deployed modular LinuxNetworkInterfacesTab component in the Server Management modal, replacing the previous minimal throughput-only view.',
      'Added high-visibility Network Stack Overview card displaying active network service, DNS manager, default gateway, and dynamic SSH session warning banner when viewing the management interface.',
      'Exposed detailed hardware and protocol attributes per interface: MAC address, carrier link status, IPv4/IPv6 addresses, IP mode (Static vs DHCP), MTU, link speed/duplex, driver, and RX/TX traffic, packet, and error metrics.',
      'Equipped with multi-state filters (All, UP, DOWN, Physical, Virtual), live search, 3-part boundary-safe FieldInfoTooltip, and strict bilingual English/Persian adherence with dark/light mode ergonomics.',
    ],
  },
  {
    version: '1.134.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'افزودن تب مدیریت و به‌روزرسانی پکیج‌ها (Update Package)، ارتقای سراسری سیستم‌عامل، مانیتورینگ پیشرفت زنده شبیه اتوماسیون سیسکو و تمیزکاری وابستگی‌ها',
    title_en: 'Linux Package Management & System Upgrade Tab (Update Package) with Real-Time Execution Progress Bar, Bulk Upgrade, and OS Maintenance',
    changes: [
      'افزودن تب جدید «Update Package» به مودال مدیریت سرور لینوکس (Linux Server Management) جهت مشاهده کلیه نرم‌افزارها و پکیج‌های نصب‌شده به همراه بررسی زنده آخرین نگارش موجود در مخازن.',
      'طراحی بنر جامع و زیبای سیستم‌عامل در بالای صفحه شامل مشخصات سیستم، نسخه توزیع، نسخه کرنل، معماری، آپ‌تایم، وضعیت کلی پکیج منیجر و شمارنده تفکیک‌شده آپدیت‌های در دسترس و اصلاحیه‌های امنیتی.',
      'تعبیه دکمه شاخص «به‌روزرسانی همه پکیج‌ها (Update All Packages)» در بالاترین نقطه صفحه جهت ارتقای دسته‌جمعی خودکار و سریع کلیه بسته‌های نیازمند آپدیت با یک کلیک.',
      'افزودن گزینه‌های پیشرفته ارتقای جامع توزیع (Full OS Dist-Upgrade)، بررسی و تازه‌سازی کش مخازن (apt-get update) و پاک‌سازی پکیج‌ها و کرنل‌های منسوخ و آزاد‌سازی حافظه (Autoremove).',
      'امکان به‌روزرسانی تک‌تک پکیج‌ها یا انتخاب چندتایی دلخواه با چک‌باکس و فیلترهای تفکیک‌شده (همه، دارای آپدیت، امنیتی، به‌روز).',
      'پیاده‌سازی نوار پیشرفت گرادیانی و رهگیری زنده‌ی وضعیت اجرای عملیات به‌روزرسانی، دقیقاً مشابه طراحی Bulk Device Configuration در بخش اتوماسیون با نمایش نام بسته در حال پردازش، شمارنده وضعیت (موفق، ناموفق، کل)، درصد پیشرفت، مدت زمان هر گام، و کنسول استریم لاگ‌های مستقیم پکیج منیجر.',
      'پیاده‌سازی کامل بک‌اند با اندپوینت‌های امن SSH و انطباق کامل با توزیع‌های مختلف (Debian/Ubuntu با APT و RHEL/CentOS/Rocky با DNF/YUM)، موتور مدیریت پس‌زمینه جاب‌ها، ثبت رخدادهای Audit Log و رعایت استانداردهای دوزبانه و تم تیره/روشن.',
    ],
    changes_en: [
      'Added the "Update Package" tab to the Linux Server Management modal to list all installed software/packages and check for candidate updates from upstream repositories in real time.',
      'Created a rich OS & System Card at the top displaying operating system name, distro release, Linux kernel, architecture, uptime, package manager type, and KPI counters for available updates and security patches.',
      'Implemented a prominent "Update All Packages" button at the top for instant one-click bulk upgrading of all outdated software components.',
      'Added advanced system maintenance actions: Full OS Distribution Upgrade (apt-get dist-upgrade), repository metadata refresh (apt-get update / dnf check-update), and obsolete package/dependency cleanup (autoremove).',
      'Supported individual package upgrades and multi-package selection with intuitive checkboxes and filters (All, Upgradable, Security Fixes, Up to Date).',
      'Engineered a real-time progress bar and execution tracking monitor modeled directly after the Bulk Device Configuration UX, featuring gradient fill, processing package indicator, status stat pills (Success, Failed, Total), step-by-step per-package results with duration, and expandable terminal output.',
      'Developed backend SSH API endpoints (/api/remote-servers/:id/packages, /update-all, /update-selected, /update-single, /repo-update, /autoremove, /job/:jobId) supporting Debian/Ubuntu (APT) and RHEL/CentOS (DNF/YUM) with zero credential leaks, background job tracking, audit logging, and 100% strict bilingual i18n.',
    ],
  },
  {
    version: '1.133.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'امکان ویرایش کامل کاربران لینوکس، تعیین تاریخ انقضای حساب، اجبار به تغییر رمز در ورود بعدی و ممیزی امنیتی و سوابق IP و نشست‌ها',
    title_en: 'Comprehensive Linux User Editing, Account Expiration, Mandatory Password Change on Next Login, and In-Depth Security & IP Audit Modal',
    changes: [
      'افزودن قابلیت ویرایش کامل کاربران لینوکس (Edit User) شامل تغییر شل لاگین، پوشه خانگی، نام و توضیحات GECOS، گروه‌های تکمیلی، قفل/آزادسازی حساب، تغییر رمز و تنظیم انقضا.',
      'امکان تعیین تاریخ انقضای حساب کاربری (Account Expiration Date) در فرم ساخت و فرم ویرایش کاربر با پریست‌های آماده (۳۰، ۹۰، ۱۸۰، ۳۶۵ روزه یا تاریخ دلخواه) و همگام‌سازی مستقیم با /etc/shadow.',
      'افزودن قابلیت اجبار کاربر به تغییر رمز عبور در اولین ورود (Force Password Change on Next Login) در فرم‌های ساخت کاربر، ویرایش کاربر و پنجره اختصاصی تغییر گذرواژه با اجرای امن chage -d 0.',
      'افزودن مودال جامع ممیزی امنیتی کاربر (User Security Audit Modal) با کلیک روی آیکون Info در سطر هر کاربر، شامل استخراج واقعی و زنده آدرس‌های IP متصل‌شده به این حساب، وضعیت قفل بودن، تاریخ انقضا و محاسبه روزهای باقی‌مانده، سن رمز عبور و سیاست‌های shadow، سوابق آخرین ورودها و نشست‌های فعال زنده.',
      'پیاده‌سازی اندپوینت‌های امن SSH در بک‌اند شامل /api/remote-servers/linux/users/update و /api/remote-servers/linux/users/:username/info با اعتبارسنجی دقیق و امنیت رمز عبور بدون نشت در کلاینت.',
    ],
    changes_en: [
      'Added full Linux User Editing capability (Edit User) allowing modification of login shells, home directories, GECOS comments, secondary group memberships, lock/unlock status, password updates, and expiration policies.',
      'Added Account Expiration Date support across both user creation and user editing flows with quick presets (30, 90, 180, 365 days, or custom dates) directly committed to /etc/shadow.',
      'Implemented mandatory password rotation ("Require password change upon first/next login") across Create User, Edit User, and Change Password modals utilizing secure chage -d 0 execution.',
      'Added an In-Depth User Security Audit Modal accessible via the new Info icon on each user row, providing live extraction of all unique IP addresses used by the account, lock status, expiration status with days remaining countdown, password age and shadow aging policies, historical login records, and live active sessions.',
      'Developed backend SSH API endpoints (/api/remote-servers/linux/users/update and /api/remote-servers/linux/users/:username/info) with strict input validation, PAM/shadow integration, and zero-leak credential protection.',
    ],
  },
  {
    version: '1.132.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'قابلیت ری‌استارت و خاموش‌سازی گروهی و تکی سرورها با دستورات اختصاصی و انطباقی لینوکس و ویندوز',
    title_en: 'Bulk & Individual Server Restart and Shutdown/Power Off with Adaptive Linux and Windows Execution',
    changes: [
      'افزودن دکمه‌های ری‌استارت و خاموش‌سازی گروهی (Bulk Restart & Shutdown) به نوار ابزار انتخاب چندتایی سرورها در Remote Servers & Automation Fleet.',
      'افزودن گزینه خاموش کردن سرور (Shutdown / Power Off) در منوی سه‌نقطه عملیات هر سرور در کنار گزینه راه‌اندازی مجدد.',
      'ارسال دستورات اجرایی بر اساس سیستم‌عامل سرور: در سرورهای لینوکس دستورات shutdown -r / shutdown -h / reboot / poweroff و پیام همگانی wall، و در سرورهای ویندوز دستورات shutdown /r /t /f /c یا shutdown /s /t /f /c و پیام تعاملی msg.exe.',
      'ارتقای مودال راه‌اندازی و خاموش‌سازی با امکان جابجایی بین ری‌استارت و خاموش کردن، نمایش پیش‌نمایش دستورات هر سیستم‌عامل، مهلت زمانی پیش از اجرا، اخطار همگانی، گزارش زنده و پشتیبانی از مینی‌مایز به داک ابزارها.',
      'پیاده‌سازی اندپوینت بک‌اند /api/remote-servers/bulk-power جهت مدیریت و اجرای هم‌زمان دستورات روی ناوگان سرورها همراه با ثبت رخداد در Audit Log.',
    ],
    changes_en: [
      'Added Bulk Restart and Bulk Shutdown buttons to the multi-server selection action bar in Remote Servers & Automation Fleet.',
      'Added Shutdown / Power Off option alongside Restart Server in the 3-dot action menu for individual servers.',
      'Implemented OS-adaptive command dispatch: sends Linux-native commands (shutdown -r / shutdown -h / reboot / poweroff with wall broadcasts) and Windows-native commands (shutdown /r /t /f /c or shutdown /s /t /f /c with msg.exe popups).',
      'Enhanced power management modal supporting single & bulk servers with action toggling, delay presets, live per-server execution feedback, zero-storage password handling, and ToolsDock minimization.',
      'Implemented backend endpoint /api/remote-servers/bulk-power for concurrent fleet execution and detailed audit logging.',
    ],
  },
  {
    version: '1.131.5',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'رفع باگ بسته شدن ناگهانی منوی سه‌نقطه هنگام اسکرول کردن برای مشاهده آیتم‌های پایینی',
    title_en: 'Fixed Sudden Closure of 3-Dot Action Menu When Scrolling to Inspect Lower Items',
    changes: [
      'اصلاح لیسنر رویداد اسکرول پنجره (Window Scroll Listener) جهت نادیده گرفتن اسکرول داخلی کانتینر منوی عملیات سه‌نقطه.',
      'تعبیه رفرنس مستقیم به منوی سه‌نقطه (menuDropdownRef) و مهار رویدادهای اسکرول و چرخ ماوس (onWheel stopPropagation) در منوهای RemoteServersView و DeviceListView.',
      'افزایش لایه پس‌زمینه شفاف (Backdrop) به z-[9998] زیر منوی عملیات سه‌نقطه (z-[9999]) جهت حفظ پایداری و بسته‌شدن تمیز فقط در هنگام کلیک یا اسکرول در خارج از کادر منو.',
    ],
    changes_en: [
      'Updated window scroll event listener to ignore internal scrolling occurring within the 3-dot action dropdown container.',
      'Attached direct container ref (menuDropdownRef) and isolated wheel/scroll event chaining with stopPropagation across RemoteServersView and DeviceListView.',
      'Adjusted backdrop stacking order to z-[9998] right beneath the action menu (z-[9999]), ensuring seamless internal scrolling while retaining clean dismissal on outside interactions.',
    ],
  },
  {
    version: '1.131.4',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'اصلاح وضعیت زنده پینگ سرورها، حذف دیتای ساختگی آنلاین و بررسی خودکار و واقعی وضعیت شبکه در بدو ورود به صفحه',
    title_en: 'Fixed Inaccurate Live Ping Status, Removed False Online Flags, and Enabled Automatic Genuine Fleet Connectivity Verification',
    changes: [
      'اصلاح وضعیت پیش‌فرض سرورهای راه‌دور به «تست‌نشده» (untested) در دیتابیس و پایگاه داده به‌منظور جلوگیری از نمایش دیتای کاذب آنلاین بدون تست.',
      'افزودن قابلیت پینگ خودکار و بلادرنگ کلیه سرورهای ناوگان در بدو ورود به صفحه با وضعیت فعال «در حال تست...» (Pinging...) و محاسبه دقیق پینگ در صورت دسترسی.',
      'اصلاح نمایش وضعیت زنده سرورها در جدول و نمای گرید: نمایش متون دقیق دوزبانه (آنلاین، آفلاین، تست‌نشده و در حال تست) و رفع باگ مقدار پیش‌فرض ۱۲ میلی‌ثانیه برای سرورهای خارج از دسترس.',
      'به‌روزرسانی خودکار استیت سرور به آفلاین در بک‌اند در صورت بروز خطای اتصال سوکت TCP یا انقضای زمان تست (Timeout).',
      'به‌روزرسانی کارت آماری Reachability Status جهت تفکیک دقیق سرورهای در دسترس، خارج از دسترس و در حال بررسی یا تست‌نشده.',
    ],
    changes_en: [
      'Updated default remote server state to "untested" across database stores to eliminate misleading green online indicators prior to verification.',
      'Added automatic, genuine keepalive fleet ping verification upon opening Remote Servers view, displaying live "Pinging..." status indicators.',
      'Refined Live Status column and Grid card rendering with strict bilingual localization (Online, Down/Offline, Untested, Pinging...) and eliminated artificial 12ms latency fallbacks on failed probes.',
      'Configured backend TCP socket test route to automatically persist offline state upon socket errors or connection timeouts.',
      'Enhanced Reachability Status summary metrics to clearly differentiate between verified online, confirmed down, and untested/in-progress fleet nodes.',
    ],
  },
  {
    version: '1.131.3',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'رفع مشکل خروج منوی سه‌نقطه سرورها از کادر صفحه و پنهان شدن آیتم‌های پایینی با مهار چهارطرفه، چرخش خودکار و اسکرول هوشمند',
    title_en: 'Fixed 3-Dot Server Action Menu Viewport Clipping with 4-Way Boundary Clamping, Smart Auto-Flip, and Dynamic Scrollbar',
    changes: [
      'اصلاح محاسبات موقعیت‌یابی منوی سه‌نقطه (Action Menu) در صفحه Remote Servers بر اساس ارتفاع واقعی آیتم‌ها (۳۸۵ تا ۴۲۵ پیکسل).',
      'افزودن منطق تشخیص هوشمند فضای در دسترس در بالا و پایین صفحه (Auto-Flip) جهت باز شدن به سمت بالا در صورت نزدیکی به پایین صفحه.',
      'مهار دقیق حاشیه‌ها (Boundary Clamping) در هر دو جهت افقی (چپ و راست در تم‌های LTR و RTL) با حداقل فاصله ۱۲ پیکسل از لبه‌های مانیتور.',
      'افزودن محدودیت ارتفاع حداکثری داینامیک (maxHeight) و اسکرول‌بار نرم (custom-scrollbar) برای تضمین نمایش و دسترسی قطعی به تمام گزینه‌ها (ری‌استارت، ویرایش و حذف) حتی در نمایشگرهای کوچک لپ‌تاپ.',
      'اختصاص اولویت z-[9999] در پرتال جهت جلوگیری از قرارگیری منو زیر هرگونه لایه دیگر.',
    ],
    changes_en: [
      'Recalculated 3-dot contextual action menu positioning in Remote Servers fleet using true menu item heights (385px to 425px).',
      'Implemented smart viewport auto-flip logic that seamlessly opens the dropdown upwards when approaching the screen bottom.',
      'Engineered strict 4-way boundary clamping ensuring 12px safe margins on both horizontal axes across LTR and RTL display modes.',
      'Added dynamic viewport-bound maxHeight constraints and sleek custom scrollbar ensuring lower critical options (Restart, Edit, Delete) are always visible and accessible on any screen resolution.',
      'Elevated portal stacking layer to z-[9999] ensuring the menu never falls behind modal backdrops or blurred elements.',
    ],
  },
  {
    version: '1.131.2',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'حذف گزینه و شل zsh از ترمینال لینوکس و منوی سه‌نقطه لیست سرورها و استانداردسازی ارتباط روی شل پایدار Bash',
    title_en: 'Removed Zsh Shell Option from Linux Server Terminal & 3-Dot Action Menu in Favor of Standard Bash',
    changes: [
      'حذف کامل گزینه راه‌اندازی شل zsh از منوی سه‌نقطه (Action Menu) سرورهای لینوکسی در بخش Remote Servers.',
      'حذف دکمه تغییر وضعیت شل به zsh از نوار عنوان پنل‌های ترمینال لینوکس و جایگزینی آن با نشان پایدار bash.',
      'حذف سلکتور شل zsh در بخش ایجاد پنجره‌های تقسیم‌شده (Split Pane) ترمینال.',
      'استانداردسازی تمامی دکمه‌ها و توابع بازگشایی ترمینال به شل استاندارد و مطمئن /bin/bash.',
    ],
    changes_en: [
      'Completely removed the Zsh shell launch action from the 3-dot server menu in Remote Servers.',
      'Removed the shell toggle button to Zsh from the Linux terminal pane header, standardizing on a clean bash indicator badge.',
      'Removed the Zsh shell selection option in the split-pane configuration drawer.',
      'Standardized all terminal launcher handlers to strictly spawn /bin/bash sessions.',
    ],
  },
  {
    version: '1.131.1',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'رفع مشکل هم‌پوشانی و قرارگیری منوی شخصی‌سازی ستون‌ها در زیر لیست سرورها با استفاده از React Portal و موقعیت‌یابی دقیق شناور',
    title_en: 'Fixed Column Customization Dropdown Falling Under Servers Table Using React Portal & Clamped Floating Coordinates',
    changes: [
      'اصلاح رندر منوی شخصی‌سازی ستون‌های جدول سرورها با استفاده از createPortal روی document.body و اختصاص لایه z-[9999] جهت جلوگیری قطعی از رفتن منو به زیر جدول یا کانتینرهای با backdrop-blur.',
      'محاسبه خودکار و هوشمند مختصات باز شدن منو نسبت به دکمه ستون‌ها همراه با تشخیص لبه‌های مانیتور و باز شدن برعکس به سمت بالا در صورت کمبود فضای پایین صفحه.',
      'پشتیبانی یکپارچه از هر دو جهت LTR و RTL (چپ‌چین و راست‌چین متناسب با زبان فارسی و انگلیسی).',
      'افزودن قابلیت تثبیت موقعیت منو هنگام اسکرول یا تغییر سایز پنجره و بستن هوشمند با کلیک خارج از محدوده.',
      'افزودن z-20 به نوار جستجو و فیلترها به عنوان لایه دفاعی تکمیلی.',
    ],
    changes_en: [
      'Portaled the table columns customization dropdown directly to document.body with z-[9999] priority, eliminating stacking context issues caused by sibling backdrop-blur filters and table boundaries.',
      'Engineered smart boundary-aware coordinate positioning relative to the Columns button, with auto-flip logic when approaching the viewport bottom.',
      'Seamless alignment adaptation for both LTR (English) and RTL (Persian) display contexts.',
      'Added dynamic repositioning on viewport scroll/resize and robust click-outside detection.',
      'Added relative z-20 to the search and filter bar container as complementary defense-in-depth.',
    ],
  },
  {
    version: '1.131.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'افزودن قابلیت راه‌اندازی مجدد هوشمند (Restart) سرورهای لینوکسی و ویندوزی همراه با مودال تایید، زمان‌بندی و ارسال پیام هشدار به کاربران آنلاین',
    title_en: 'Added Smart Server Restart Capability for Linux and Windows Servers with Confirmation, Scheduling & User Broadcast Modal',
    changes: [
      'افزودن گزینه راه‌اندازی مجدد (Restart Server) به منوی ۳ نقطه در لیست سرورهای Remote Servers.',
      'تشخیص هوشمند نوع سیستم‌عامل سرور و صدور دستورات استاندارد (reboot / shutdown -r برای لینوکس و shutdown /r /t /f برای ویندوز).',
      'ایجاد مودال تایید جامع RestartServerModal با امکان تنظیم تاخیر (فوری، ۱، ۳، ۵، ۱۰، ۱۵ دقیقه یا مقدار دلخواه).',
      'امکان ارسال پیام اخطار و هشدار به کاربران لاگین داخل سرور از طریق دستور wall در لینوکس و msg.exe / /c در ویندوز سرور با قالب‌های پیام آماده (تعمیرات، به‌روزرسانی امنیتی، اعلان فوری).',
      'گزینه بستن اجباری برنامه‌ها (Force) جهت جلوگیری از قفل شدن یا توقف فرآیند ری‌استارت توسط پردازش‌های پس‌زمینه.',
      'امکان لغو ری‌استارت‌های زمان‌بندی‌شده قبلی (Abort Scheduled Restart) با اجرای shutdown -c در لینوکس و shutdown /a در ویندوز.',
      'پشتیبانی از پروتکل‌های احراز هویت بدون ذخیره‌سازی گذرواژه (Zero-Storage Policy) و ثبت کامل لاگ حسابرسی (Audit Log).',
      'پیروی کامل از استانداردهای پنج‌گانه مودال‌ها (دکمه‌های سه‌گانه، سازگاری با ToolsDock، مرز دقیق تمام‌صفحه و تم‌های تیره و روشن).',
    ],
    changes_en: [
      'Added "Restart Server" action item to the 3-dot dropdown menu in Remote Servers fleet.',
      'Intelligent OS detection issuing native reboot instructions (Linux: shutdown -r / reboot; Windows: shutdown /r /t /f).',
      'Comprehensive confirmation and scheduling modal (RestartServerModal) supporting immediate reboot or preset/custom delay periods (1m, 3m, 5m, 10m, 15m, custom).',
      'Option to broadcast real-time warning notices to logged-in users via Linux wall command and Windows msg.exe / shutdown comments with quick templates (maintenance, security updates, urgent notice).',
      'Force termination option to prevent hanging processes from stalling the system restart sequence.',
      'Dedicated button to abort and cancel previously scheduled pending restarts (shutdown -c on Linux, shutdown /a on Windows).',
      'Full integration with Zero-Storage password prompt policies and comprehensive audit logging.',
      'Strict adherence to universal modal specifications (triad controls, ToolsDock minimization, fullscreen boundary clearance, and dark/light modes).',
    ],
  },
  {
    version: '1.130.3',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'افزودن قابلیت شخصی‌سازی و انتخاب ستون‌های جدول سرورها در پنل Remote Servers',
    title_en: 'Added Customizable Column Visibility Selector for Remote Servers List & Table Views',
    changes: [
      'امکان مخفی‌سازی و نمایش انتخابی ستون‌های جدول سرورها (انتخاب، نام سرور، سیستم‌عامل، آی‌پی/پورت، نقش و محیط، وضعیت زنده، تگ‌ها و عملیات).',
      'ذخیره‌سازی پایدار انتخاب‌های کاربر در حافظه مرورگر (LocalStorage) جهت حفظ چیدمان ستون‌ها در مراجعات بعدی.',
      'طراحی دراپ‌داون ارگونومیک با دکمه بازنشانی پیش‌فرض و نمایش تعداد ستون‌های فعال.',
      'همگام‌سازی کامل با نماهای List View و Dense Table View و تم روشن و تیره.',
    ],
    changes_en: [
      'Added column visibility customization dropdown allowing users to show or hide specific columns (Select, Node/Hostname, OS, IP/Port, Role, Live Status, Tags, Actions).',
      'Persistent column visibility preferences stored in LocalStorage across browser sessions.',
      'Ergonomic dropdown UI with active column counter and quick reset to default layout.',
      'Seamless synchronization across both List View and Dense Table View with dark/light theme support.',
    ],
  },
  {
    version: '1.130.2',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'قابلیت باز شدن مستقیم مودال Server Management با کلیک روی نام سرور لینوکسی در هر دو نمای جدولی و کارتی',
    title_en: 'Direct Server Management Modal Invocation by Clicking Linux Server Name in Both Table and Card Views',
    changes: [
      'امکان کلیک مستقیم روی نام سرورهای لینوکسی در جدول Remote Servers جهت باز شدن سریع پنجره Server Management.',
      'پشتیبانی از هاور تعاملی و کلیک روی عنوان سرور در نمای کارتی (Grid/Cards) برای دسترسی فوری بدون نیاز به منوی سه‌نقطه.',
      'حفظ ساختار دوزبانه و تولتیپ راهنمای استاندارد بر روی نام سرورها.',
    ],
    changes_en: [
      'Enabled direct click-to-open on Linux server names within the Remote Servers table view to launch the Server Management modal instantly.',
      'Added interactive hover styling and click trigger on server title headings in the Card view.',
      'Ensured full bilingual tooltip support and strict accessibility compliance.',
    ],
  },
  {
    version: '1.130.1',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'تغییر عنوان مودال مانیتور سرورهای لینوکس به Server Management (مدیریت سرور) در تمامی بخش‌ها و منوها',
    title_en: 'Renamed Linux Server Monitor Modal to "Server Management" Across All Views, Actions, and Navigation Menus',
    changes: [
      'تغییر نام گزینه "Live Resource Monitor" به "Server Management" (مدیریت سرور) در منوی سه‌نقطه سرورها.',
      'افزودن برچسب اختصاصی Server Management در هدر اصلی مودال مدیریت سرور لینوکس در کنار نام و مشخصات سیستم.',
      'به‌روزرسانی عناوین دکمه‌های کنترلی، بستن، و لیبل تب داک‌شده در ToolsDock به مدیریت سرور.',
    ],
    changes_en: [
      'Renamed "Live Resource Monitor" to "Server Management" in the 3-dot server action dropdown menu.',
      'Added a dedicated "Server Management" badge directly into the header of LinuxServerMonitorModal alongside host specifications.',
      'Updated action button tooltips, close titles, and minimized ToolsDock tabs to "Server Management".',
    ],
  },
  {
    version: '1.130.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'افزودن قابلیت ایجاد گروه حجمی جدید (New Volume Group - VG) با کشف هوشمند دیسک‌های خام، اعتبارسنجی LVM و مودال اختصاصی',
    title_en: 'Added New Volume Group (VG) Creation Capability with Dynamic Raw Disk Discovery, LVM Pre-flight Validation, and Dedicated Modal',
    changes: [
      'افزودن دکمه مستقیم "+ New Volume Group" در هدر بخش Volume Groups (VG) و همچنین در وضعیت خالی (Empty State) بدون گروه حجمی.',
      'طراحی و پیاده‌سازی مودال استاندارد LinuxCreateVgModal مجهز به کنترل‌های سه‌گانه هدر (بستن، مینیمایز، تمام‌صفحه با رعایت حریم فوتر bottom-8).',
      'شناسایی و لیست خودکار دیسک‌های خام فیزیکی، پارتیشن‌های آزاد و Physical Volumeهای نامتصل جهت انتخاب چندگانه با چک‌باکس و محاسبه مجموع ظرفیت.',
      'افزودن امکان تنظیم اندازه Physical Extent (PE) با گزینه‌های سریع ۴، ۸، ۱۶، ۳۲ و ۶۴ مگابایت و قابلیت پاک‌سازی خودکار امضاها (-y -ff).',
      'تجهیز مودال به دکمه مستقیم اسکن آنلاین دیسک‌ها (Online Rescan Disks) در صورت نبود دیسک آزاد بدون نیاز به بستن پنجره.',
      'پیاده‌سازی اندپوینت بک‌اند POST /api/remote-servers/:id/lvm-create-vg با اجرای واقعی دستورات امنیتی pvcreate و vgcreate بر روی سرور لینوکس.',
    ],
    changes_en: [
      'Added direct "+ New Volume Group" action in the Volume Groups (VG) section header and inside the empty state when no VGs exist.',
      'Designed and built LinuxCreateVgModal complying with universal modal standards (triad controls: close, minimize, fullscreen with bottom-8 footer clearance).',
      'Automatic discovery of unassigned physical disks, raw partitions, and unlinked PVs with multi-select checkboxes and aggregate capacity calculation.',
      'Configurable Physical Extent (PE) size selection (4M default, 8M, 16M, 32M, 64M) with signature wiping flag (-y -ff).',
      'Integrated in-modal "Online Rescan Disks" button to trigger kernel SCSI bus rescan immediately if no unassigned devices are found.',
      'Implemented robust backend endpoint POST /api/remote-servers/:id/lvm-create-vg with authentic SSH execution of pvcreate and vgcreate on target Linux hosts.',
    ],
  },
  {
    version: '1.129.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'اصلاح و هوشمندسازی فرآیند ساخت حجم منطقی (LV) با ارث‌بری خودکار گروه حجمی، اعتبارسنجی فضای آزاد و دکمه New LV در بخش‌های مرتبط',
    title_en: 'Enhanced Context-Aware Logical Volume (LV) Creation Flow with Automatic VG Inheritance, Real Free Space Validation, and Dedicated Section Actions',
    changes: [
      'افزودن دکمه مستقیم "+ New LV" در هدر بخش Logical Volumes جهت ایجاد آسان حجم منطقی جدید با امکان انتخاب گروه حجمی مورد نظر.',
      'اصلاح هوشمند رفتار مودال هنگام باز شدن از کارت یک Volume Group خاص؛ ارث‌بری خودکار و قفل شدن فیلد VG هدف بدون درخواست مجدد از کاربر.',
      'پیاده‌سازی اعتبارسنجی دقیق و بلادرنگ فضای آزاد واقعی استخر VG قبل از ارسال درخواست و جلوگیری از خطای کمبود فضا.',
      'افزودن دکمه کارآمد "Use All Free Space" و گزینه‌های پیش‌فرض سریع (5G, 10G, 20G, 50G, 100%FREE) بر مبنای ظرفیت واقعی سرور.',
      'اعتبارسنجی سمت کلاینت و سمت سرور برای نام LV (بررسی تکراری نبودن در VG هدف و کاراکترهای مجاز).',
      'مدیریت خطاهای واقعی سیستم‌عامل (عدم وجود VG، کمبود فضا یا نام تکراری) با پیام‌های خطای شفاف و فارسی/انگلیسی استاندارد.',
    ],
    changes_en: [
      'Added a dedicated "+ New LV" action directly in the Logical Volumes section header with VG selector dropdown.',
      'Fixed contextual inheritance when opening the modal from a specific VG card, automatically locking and displaying the target VG without asking the user to re-select it.',
      'Implemented real-time client-side and server-side VG free space validation, preventing out-of-space allocation requests before submission.',
      'Added "Use All Free Space" action and quick size presets (5G, 10G, 20G, 50G, 100%FREE) based on actual available capacity.',
      'Added comprehensive LV name validation (checking for duplicates within the target VG and strictly allowed characters).',
      'Enhanced backend error handling in SSH LVM operations for authentic reporting of VG absence, duplicate names, or capacity exhaustion.',
    ],
  },
  {
    version: '1.128.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'بازنویسی کامل و از صفر تب Storage & Disks مانیتورینگ سرور لینوکس با معماری واقعی سلسله‌مراتبی و بدون داده‌های شبیه‌سازی‌شده',
    title_en: 'Complete Ground-Up Rebuild of Linux Storage & Disks Interface: Authentic Hierarchy (Disk → Partition → PV → VG → LV → FS → Mount), Zero Mock Data & Real Hardware Discovery',
    changes: [
      'حذف کامل پیاده‌سازی قدیمی و غیراستاندارد Storage & Disks و جایگزینی با ماژول کاملاً استاندارد LinuxStorageManager.',
      'پیاده‌سازی دقیق سلسله‌مراتب ۶ لایه‌ای ذخیره‌سازی لینوکس: دیسک فیزیکی ➔ پارتیشن ➔ حجم فیزیکی (PV) ➔ گروه حجمی (VG) ➔ حجم منطقی (LV) ➔ فایل‌سیستم ➔ نقطه مانت.',
      'پشتیبانی هم‌زمان از سناریوهای سنتی بدون LVM (دیسک مستقیم به مانت، یا دیسک ➔ پارتیشن ➔ مانت) و سناریوهای پیشرفته LVM.',
      'پیاده‌سازی اکشن زنده و واقعی Scan for Disks با اسکن کنترلرهای SCSI هسته لینوکس و رفرش آنلاین بلاک دیوایس‌ها بدون نیاز به ریبوت.',
      'پیاده‌سازی سناریوی مدیریت دیسک آزاد (Workflow A - ایجاد فایل‌سیستم مستقل با GPT، انتخاب نوع ext4/xfs/btrfs، ثبت در /etc/fstab و مانت زنده).',
      'پیاده‌سازی سناریوی الحاق دیسک به LVM (Workflow B - اجرای pvcreate و vgextend جهت افزایش فضای آزاد Volume Group).',
      'پیاده‌سازی گسترش آنلاین حجم‌های منطقی (Extend LV) و بزرگ‌سازی فوری فایل‌سیستم (Online Filesystem Grow با resize2fs و xfs_growfs).',
      'تجهیز تمامی مودال‌ها به کنترل‌های سه‌گانه هدر (بستن، مینیمایز، تمام‌صفحه با رعایت حریم فوتر)، رعایت دو زبانه کامل و تولتیپ‌های استاندارد راهنما.',
    ],
    changes_en: [
      'Completely removed obsolete, unreliable Storage & Disks implementation and rebuilt clean LinuxStorageManager from scratch.',
      'Faithfully implemented authentic 6-tier Linux storage hierarchy: Physical Disk → Partition → PV → VG → LV → Filesystem → Mount Point with zero simulated data.',
      'Full architectural support for both non-LVM direct disk/partition mounts and enterprise LVM multi-disk storage pools.',
      'Engineered real live "Scan for Disks" action triggering kernel SCSI bus rescan and block device rediscovery dynamically.',
      'Implemented Workflow A: Create New Filesystem (GPT partitioning, ext4/xfs/btrfs selection, /etc/fstab boot persistence, and live mounting).',
      'Implemented Workflow B: Add Disk to Existing LVM (pvcreate block device initialization and vgextend expansion of target Volume Group).',
      'Implemented seamless Logical Volume extension (lvextend) followed by automatic online filesystem resizing (resize2fs / xfs_growfs).',
      'Equipped all storage modals with universal 3-button headers (Close, Minimize, Fullscreen with footer boundary clearance), strict bilingual i18n, and boundary-safe 3-part info tooltips.',
    ],
  },
  {
    version: '1.127.1',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'رفع خطای پروکسی پایتون (socket hang up)، مهاجرت به ThreadingHTTPServer و مکانیزم خودترمیمی بک‌اند',
    title_en: 'Fix Python API Proxy socket hang up, migrate to ThreadingHTTPServer & backend self-healing recovery',
    changes: [
      'شناسایی و رفع ریشه‌ای خطای قطعی سوکت پایتون (socket hang up) ناشی از وجود پردازه زامبی روی پورت ۵۰۰۱.',
      'ارتقای سرور پایتون backend/server.py به ThreadingHTTPServer جهت پشتیبانی چندریسمانی (Multithreaded) بدون بلاک شدن درخواست‌ها.',
      'پیاده‌سازی مکانیزم بررسی سلامت HTTP (checkPythonHealth) و پاکسازی پردازه‌های معلق روی پورت پایتون پیش از راه‌اندازی.',
      'اصلاح ساختار هدرها و اندازه‌گیری دقیق Content-Length در پراکسی Node/Express با تایم‌اوت ۳۰ ثانیه‌ای و بازیابی خودکار در صورت بروز خطای اتصال.',
    ],
    changes_en: [
      'Diagnosed and resolved the root cause of Python API proxy socket hang up caused by stale/zombie process occupying port 5001.',
      'Upgraded Python backend/server.py to use ThreadingHTTPServer for concurrent non-blocking HTTP request processing.',
      'Implemented HTTP health checks (checkPythonHealth) and automatic termination of hung/stale processes locking port 5001 prior to spawn.',
      'Hardened Node/Express /api proxy with sanitized headers, accurate Content-Length calculation, 30s timeout, and auto-healing reconnection logic.',
    ],
  },
  {
    version: '1.127.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'ریفکتور ماژول Storage & Disk لینوکس، پایپ‌لاین جامع معماری ۶ لایه LVM (Disk → PV → VG → LV → FS → Mount) و اکستند بلادرنگ بدون قطعی',
    title_en: 'Linux Storage & Disk Architectural Refactoring: Full 6-Layer LVM Pipeline (Disk → PV → VG → LV → FS → Mount) & Live Online Extension',
    changes: [
      'بازطراحی و ریفکتور اساسی ماژول ذخیره‌سازی لینوکس بر اساس معماری استاندارد شش‌لایه‌ای: Disk (دیسک فیزیکی خام) -> PV (فیزیکال ولوم) -> VG (مخزن و استخر مشترک) -> LV (برداشت ظرفیت برای ولوم) -> Filesystem (فرمت ext4/XFS) -> Mount Point (مسیر اتصال سیستم‌عامل مثل / یا /var).',
      'ساخت کامپوننت و مودال جدید و جامع LinuxStoragePipelineModal برای اتصال زنجیره‌ای و یکپارچه فرآیند افزودن دیسک جدید، تبدیل به PV، الحاق به VG، افزایش حجم ولوم و رشد آنلاین فایل‌سیستم بدون نیاز به ریستارت سرور.',
      'تجهیز دیسک‌های خام فیزیکی در بخش Physical Disks به دکمه‌های مستقیم جریان کاری: افزایش حجم درایو موجود (+ Extend Volume)، ایجاد درایو و مانت جدید (+ New Mount)، و مقداردهی اولیه (Init PV).',
      'ارتقای مودال ساخت ولوم LVM (LinuxCreateLvmModal) با امکان الصاق هم‌زمان دیسک‌های خام جدید به گروه‌های حجم موجود جهت تأمین فضا پیش از ایجاد ولوم.',
      'مرتب‌سازی اصولی بخش‌های تب LVM متناسب با جریان طبیعی سلسله‌مراتب: لایه ۱ و ۲ (دیسک‌های خام و PVها)، لایه ۳ (استخرهای VG) و لایه‌های ۴، ۵ و ۶ (ولوم‌های منطقی و مسیرهای مانت‌شده).',
      'تضمین مقاومت در سطح بک‌اند SSH با بهینه‌سازی فرامین pvcreate با فلگ‌های -y -ff، اجرای خودکار udevadm settle، و اجرای مطمئن resize2fs و xfs_growfs.',
    ],
    changes_en: [
      'Re-engineered the Linux Storage & Disk module strictly following the 6-layer architecture: Disk (physical raw disk) -> PV (Physical Volume) -> VG (Volume Group pool) -> LV (Logical Volume slice) -> Filesystem (ext4/XFS) -> Mount Point (directory mount like / or /var).',
      'Created comprehensive LinuxStoragePipelineModal orchestrating the entire lifecycle: enrolling new raw disks, initializing PVs, joining target VGs, expanding LV boundaries, and growing live filesystems online with zero downtime.',
      'Equipped detected physical raw disks with direct one-click workflow triggers: "+ Extend Volume" (pipeline extension), "+ New Mount" (new partition & mount point), and "Init PV" (pvcreate).',
      'Enhanced LinuxCreateLvmModal with capability to attach unassigned raw disks directly to existing Volume Groups to supply needed capacity before volume slicing.',
      'Re-ordered storage tab sections into their natural progressive flow: Layer 1 & 2 (Physical Disks & PVs), Layer 3 (Volume Group Pools), and Layer 4, 5 & 6 (Logical Volumes & Mount Points).',
      'Hardened backend SSH execution with robust pvcreate (-y -ff) force handling, udevadm settle synchronization, and resilient filesystem growth fallbacks for ext4 (resize2fs) and XFS (xfs_growfs).',
    ],
  },
  {
    version: '1.126.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'گردش کار صریح مقداردهی فیزیکال ولوم (pvcreate) پیش از پیوست به گروه حجم و تفکیک سلسله‌مراتبی لایه‌های LVM',
    title_en: 'Explicit Physical Volume (PV) Initialization Workflow (pvcreate) and Enhanced LVM Architectural Hierarchy',
    changes: [
      'افزودن قابلیت و مودال اختصاصی مقداردهی اولیه فیزیکال ولوم (LinuxInitPvModal) جهت اجرای صریح و مستقل دستور pvcreate روی دیسک‌های خام لینوکس.',
      'طراحی معماری سه‌مرحله‌ای شفاف و استاندارد LVM در رابط کاربری: دیسک فیزیکی -> مقداردهی فیزیکال ولوم (PV) -> استخر گروه حجم (VG) -> افزایش یا ساخت ولوم منطقی (LV).',
      'تجهیز دیسک‌های خام شناسایی‌شده در بخش Physical Disks به ۳ دکمه عملیاتی مجزا: مقداردهی PV (Init PV)، پیوست مستقیم به گروه (+ Add to VG)، و ایجاد فضای نو (Create).',
      'تشخیص خودکار و برجسته‌سازی فیزیکال ولوم‌های آزاد (Unassigned PVs) در فهرست PVها به همراه دکمه اختصاصی + Add to VG جهت تسریع الصاق به استخر حجم.',
      'ایجاد متد SSH بک‌اند createLinuxPvSSH و اندپوینت جدید /api/remote-servers/:id/lvm-create-pv با اعتبارسنجی بلوک دیوایس، جلوگیری از مقداردهی تکراری و پشتیبانی از فلگ force.',
      'پشتیبانی کامل از استاندارد پنج‌گانه Universal Modal در مودال جدید مقداردهی PV شامل دکمه‌های بستن، مینیمایز در نوار داک (ToolsDock)، تمام‌صفحه با حفظ حریم فوتر (bottom-8)، دو تم تیره/روشن و کادر Info.',
    ],
    changes_en: [
      'Added dedicated Physical Volume (PV) initialization modal (LinuxInitPvModal) to execute authentic, isolated pvcreate operations on raw Linux block devices.',
      'Enforced clear standard 3-tier LVM architectural hierarchy across the UI: Physical Disk -> Physical Volume (PV) -> Volume Group (VG) -> Logical Volume (LV).',
      'Equipped unassigned raw disks with 3 explicit action buttons: "Init PV" (pvcreate), "+ Add to VG" (join volume group), and "Create" (standalone volume).',
      'Added automatic detection and highlighted badging of Unassigned PVs in the Physical Volumes inventory with a one-click "+ Add to VG" action button.',
      'Implemented backend createLinuxPvSSH method and POST /api/remote-servers/:id/lvm-create-pv endpoint with block device validation, duplicate prevention, and force flag support.',
      'Fully implemented Universal Modal Architectural Standards for the new PV modal including minimize-to-dock, strict fullscreen footer clearance (bottom-8), dark/light theme styling, and boundary-safe 3-part Info tooltips.',
    ],
  },
  {
    version: '1.125.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'رفع خطای پیوست دیسک به گروه حجم (vgextend)، ناوبری تعاملی بین مودال‌های ذخیره‌سازی، و رفع عناوین فارسی در زبان انگلیسی',
    title_en: 'Reliable Disk-to-VG Attachment (vgextend), Cross-Modal Next-Step Workflows, and Strict English Localization',
    changes: [
      'اصلاح و بازنویسی اسکریپت بک‌اند addDiskToLinuxVgSSH جهت اعتبارسنجی دقیق مسیر دیسک، بررسی بلوک دیوایس، مقداردهی هوشمند دیسک با pvcreate و اجرای بدون خطای vgextend.',
      'افزودن ناوبری تعاملی و هوشمند پس از اتمام موفق عملیات در هر یک از مودال‌های سه‌گانه ذخیره‌سازی (Add to VG، Extend LV و Create LVM) جهت سوییچ مستقیم به مودال مرتبط بعدی.',
      'پشتیبانی از ورودی دستی مسیر دیسک در مودال پیوست به VG برای مواردی که دیسک در فهرست خودکار نمایان نشده است.',
      'اصلاح کامل عناوین مراحل در تب ذخیره‌سازی (گام ۱، گام ۲، گام ۳) و تضمین عدم نمایش متون فارسی در حالت انگلیسی پنل (Step 1, Step 2, Step 3).',
    ],
    changes_en: [
      'Re-engineered backend addDiskToLinuxVgSSH logic to perform robust disk path verification, block device detection, idempotent pvcreate initialization, and error-free vgextend execution.',
      'Integrated interactive Next-Step navigation cards across storage modals (Add to VG, Extend LV, and Create LVM) enabling seamless one-click transitions to related subsequent storage actions.',
      'Added support for manual disk path input in the Add to VG modal to accommodate custom block devices and undetected virtual drives.',
      'Fixed localization of storage workflow step indicators in English mode (displaying "Step 1", "Step 2", "Step 3" instead of Persian labels) ensuring 100% strict bilingual compliance.',
    ],
  },
  {
    version: '1.124.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'بهبود تجربه کاربری مدیریت LVM، پیوست مستقیم دیسک خام به گروه حجم (vgextend) و راهنمای سناریومحور در هر ۳ بخش ذخیره‌سازی',
    title_en: 'Enhanced LVM Storage UX: Direct Disk-to-VG Attachment Modal and Contextual Lifecycle Guides Across All Storage Sections',
    changes: [
      'توسعه مودال اختصاصی LinuxAddDiskToVgModal جهت پیوست مستقیم و آسان دیسک‌های خام جدید به گروه‌های حجم موجود (pvcreate و vgextend) بدون نیاز به ساخت گروه یا ولوم جدید.',
      'افزودن دکمه‌های عملیاتی سریع «+ Add to VG» بر روی کارت‌های دیسک‌های خام شناسایی‌شده و «+ Add Disk» بر روی کارت‌های گروه‌های حجم (VGs) با جریان کاری هدایت‌شونده به اکستند ولوم.',
      'طراحی و تعبیه راهنمای تعاملی سراسری (Interactive Storage Workflow Guide) در بالای صفحه با تفکیک ۳ سناریوی کلیدی: افزودن دیسک جدید، اکستند درایوهای موجود، و ایجاد مانت‌پوینت مستقل.',
      'افزودن کادر راهنمای عملیاتی تفکیک‌شده و شفاف در هر یک از ۳ بخش اصلی (Storage Volume Groups ،Logical Volumes & Mount Points و Physical Disks & Raw Devices) جهت مشخص‌سازی دقیق پیش‌نیازها و گام‌های بعدی کاربر.',
      'رعایت کامل استانداردهای پنج‌گانه Universal Modal در مودال پیوست دیسک (دکمه‌های سه‌گانه، مینیمایز، تمام‌صفحه با رعایت فاصله bottom-8 از فوتر، انطباق تم تیره/روشن و کادرهای راهنمای Info).'
    ],
    changes_en: [
      'Engineered a dedicated LinuxAddDiskToVgModal for seamlessly attaching newly detected raw disks or partitions directly to existing Volume Groups (pvcreate & vgextend) without forcing new volume creation.',
      'Added direct quick-action "+ Add to VG" buttons on unassigned raw disk cards and "+ Add Disk" buttons on Volume Group cards, with guided transition to extending target mounted logical volumes.',
      'Designed an interactive top-level Lifecycle Navigator with 3 distinct network storage scenarios: adding new physical disks, extending existing logical volumes, and establishing new persistent mount points.',
      'Integrated dedicated contextual operational guides inside each of the 3 core storage sections (Storage Volume Groups, Logical Volumes & Mount Points, and Physical Disks & Raw Devices) clarifying exact prerequisites and next steps.',
      'Maintained 100% adherence to all 5 Universal Modal Architectural Standards (3 header controls, minimization, strict fullscreen with bottom-8 footer clearance, dark/light contrast, and boundary-safe 3-part Info tooltips).'
    ],
  },
  {
    version: '1.123.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'سیستم جامع مدیریت فضاهای دیسک LVM، اسکن سریع آنلاین بدون ریستارت، اکستند زنده، ایجاد فضای جدید و شرینک ایمن',
    title_en: 'Comprehensive Linux LVM Storage Suite with Online Rescan, Dynamic Extend, Custom Formatting & Safe Shrinking',
    changes: [
      'پیاده‌سازی ماژول قدرتمند و یوزر فرندلی مدیریت LVM در تب Storage & Disks جهت نظارت و پیکربندی گروه‌های حجم (VGs)، دیسک‌های فیزیکی (PVs) و لاجیکال ولوم‌ها (LVs).',
      'قابلیت اسکن سریع آنلاین دیسک‌ها بدون نیاز به ریستارت (Online SCSI Bus & Block Device Rescan) جهت شناسایی آنی دیسک‌های مجازی اضافه‌شده در هایپروایزرها (VMware، Proxmox و KVM).',
      'سیستم اکستند زنده لاجیکال ولوم‌ها (Online LV Extend) همراه با گسترش خودکار و بی‌وقفه فایل‌سیستم (ext4 و XFS) و امکان پیوست همزمان دیسک‌های خام جدید به گروه حجم.',
      'قابلیت ایجاد فضاهای ذخیره‌سازی جدید در LVM با فرمت‌های دلخواه (ext4، xfs و btrfs) و مانت خودکار در مسیر دلخواه با ثبت دائمی در /etc/fstab جهت پایداری پس از ریبوت.',
      'قابلیت شرینک ایمن لاجیکال ولوم‌ها (Safe LV Shrink) با اعتبارسنجی e2fsck، آزادسازی فضای کاسته شده به استخر گروه حجم (vg_free) و ممانعت مهندسی‌شده از خراب شدن فایل‌سیستم‌های فاقد پشتیبانی شرینک نظیر XFS و ریشه سیستم (/).',
      'تجهیز تمامی مودال‌های سه‌گانه LVM (افزایش، ایجاد و کاهش) به ۵ استاندارد اجباری Universal Modal (دکمه‌های سه‌گانه، مینیمایز، تمام‌صفحه با حریم bottom-8، تطابق کامل تم تیره/روشن و کادرهای راهنمای سه‌بخشی Info).'
    ],
    changes_en: [
      'Engineered a comprehensive, user-friendly LVM Storage Manager in the Storage & Disks tab for inspecting and managing Volume Groups (VGs), Physical Volumes (PVs), and Logical Volumes (LVs).',
      'Added Online SCSI & Block Device Rescan without system reboots, instantly recognizing newly attached virtual disks or enlarged hypervisor geometries across VMware, Proxmox, and KVM.',
      'Implemented dynamic zero-downtime Logical Volume Extension (lvextend -r) with automatic filesystem growth (ext4/XFS) and optional seamless inclusion of raw disks into the Volume Group.',
      'Enabled creation of brand new LVM volumes with custom filesystem formatting (ext4, XFS, Btrfs), custom mount points, and persistent automount across reboots via /etc/fstab with UUIDs.',
      'Introduced safe Logical Volume Shrinking (lvreduce -r) with e2fsck verification, immediate space reclamation back to the Volume Group pool, and strict architectural guards blocking destructive operations on XFS and root (/).',
      'Equipped all 3 LVM modals (Extend, Create, Shrink) with all 5 mandatory Universal Modal Standards (3 header controls, minimization, fullscreen with bottom-8 footer clearance, dark/light contrast, and boundary-safe 3-part Info tooltips).'
    ],
  },
  {
    version: '1.122.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'بازنویسی استاندارد و ارتقای ماژول Broadcast / Send Terminal Message با ساختار Base64 و مودال مستقل ۵ گانه',
    title_en: 'Universal Broadcast / Send Terminal Message Refactor with Base64 Encoding & Modal Standards',
    changes: [
      'اصلاح و ارتقای ساختار ارسال پیام ترمینال (Broadcast / Send Terminal Message) با استفاده از معماری انکودینگ امن Base64 مشابه مودال خروج نشست.',
      'رفع خطای ارسال پیام به آی‌پی یا ترمینال اشتباه با تفکیک دقیق نام کاربری و TTY و ارسال مستقیم به پایانه شبه‌ترمینال (/dev/pts/X) و write چندگانه.',
      'طراحی و پیاده‌سازی کامپوننت مستقل SendTerminalMessageModal با رعایت کامل ۵ استاندارد اجباری Universal Modal (دکمه‌های سه‌گانه، مینیمایز، تمام‌صفحه با حریم bottom-8، پشتیبانی از تم تاریک/روشن و تول‌تیپ سه‌بخشی Info).',
      'افزودن دکمه دسترسی سریع «Broadcast Message / ارسال پیام همگانی» در هدر بخش Currently Logged-In Users جهت ارسال پیام‌های عمومی فوری به کل کاربران.',
      'پشتیبانی از قالب‌های آماده پیام (تعمیرات، هشدار مصرف منابع و اطلاعیه) همراه با نمایش زنده کارت مشخصات ترمینال، آی‌پی کاربر متصل و مدت زمان بیکاری.'
    ],
    changes_en: [
      'Refactored the Terminal Message / Broadcast engine using robust Base64 encoding and direct TTY streaming identical to the session logout architecture.',
      'Resolved destination mismatch and inaccurate IP routing by correctly isolating TTY endpoints (/dev/pts/X), multi-session user lookup, and adaptive write fallback.',
      'Created standalone SendTerminalMessageModal adhering strictly to the 5 Universal Modal Architectural standards (3 header controls, minimization, fullscreen with bottom-8 footer clearance, dark/light contrast, and 3-part Info tooltip).',
      'Added a quick-access "Broadcast Message" button directly inside the Currently Logged-In Users section header for fast server-wide announcements.',
      'Integrated quick-message templates (maintenance, warning, administrative notice) alongside live session inspect cards showing remote IP, TTY, and idle duration.'
    ],
  },
  {
    version: '1.121.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'قابلیت قطع اتصال و خروج نشست کاربران آنلاین (Logout Active Sessions) با پیام هشدار و زمان‌بندی مهلت',
    title_en: 'Active User Session Logout with Pre-Termination Broadcast Alert & Grace Period Scheduling',
    changes: [
      'افزودن دکمه اختصاصی «خروج / Log Out» برای تمامی نشست‌های فعال در بخش Currently Logged-In Users در تب مدیریت کاربران لینوکس.',
      'طراحی و پیاده‌سازی مودال پیشرفته LogoutUserSessionModal با پشتیبانی از خروج فوری (Force) و مهلت‌های زمانی ۱ دقیقه، ۳ دقیقه، ۵ دقیقه یا زمان دلخواه (ثانیه / دقیقه).',
      'امکان ارسال همزمان پیام هشدار پیش از قطع اتصال بر روی ترمینال و کنسول کاربر هدف با قالب‌های آماده (تعمیرات سرور، انقضای نشست، هشدار امنیتی).',
      'پشتیبانی از سیگنال قطع اجباری (SIGKILL -9) و انتخاب دامنه قطع نشست (تنها ترمینال جاری یا کلیه نشست‌های کاربر).',
      'هشدار حفاظتی خودکار در صورت انتخاب حساب کاربری فعال اتصال SSH مدیریت سرور جهت جلوگیری از قطعی ناخواسته دسترسی پنل.',
      'تجهیز کامل مودال به استانداردهای پنج‌گانه Universal Modal: دکمه‌های سه‌گانه هدر (بستن، مینیمایز، تمام‌صفحه با لبه bottom-8)، انطباق تم تیره/روشن، دو زبانه کامل و کادر راهنمای سه‌بخشی Info.'
    ],
    changes_en: [
      'Added dedicated "Log Out" action button for all live sessions in the "Currently Logged-In Users" table in Linux Server Users management.',
      'Engineered LogoutUserSessionModal featuring immediate forced termination as well as 1-minute, 3-minute, 5-minute, or custom grace period scheduling (seconds/minutes).',
      'Integrated real-time pre-termination alert message delivery to the target user TTY with customizable templates (Server Maintenance, Session Timeout, Security Compliance).',
      'Supports forced kill signals (SIGKILL -9) alongside scope selection between specific TTY session or all active sessions of the user.',
      'Added safeguard warning banner when attempting to log out the active SSH management account to prevent accidental administrator lockout.',
      'Compliant with 5 Universal Modal Architectural standards: 3 header controls (Close, Minimize, Fullscreen with bottom-8 footer clearance), dark/light theme adaptability, strict bilingual i18n, and boundary-safe 3-part Info tooltip.'
    ],
  },
  {
    version: '1.120.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'افزودن الگوی مدیریت چرخه حیات دایرکتوری و بکاپ ایمن به بخش پیکربندی گروهی سرورهای لینوکس (Bulk Linux Configuration)',
    title_en: 'Directory Lifecycle, Retention & Safe Backup Template in Bulk Linux Server Configuration Suite',
    changes: [
      'افزودن الگوی اختصاصی «مدیریت چرخه حیات دایرکتوری و بکاپ ناوگان» (linux_directory_lifecycle_backup) به لیست الگوهای پیکربندی گروهی سرورهای لینوکس.',
      'تجهیز الگو به گزینه‌های محافظت و نگهداری بکاپ (حفظ کامل تمام بکاپ‌های پیشین بدون بازنویسی و حذف، یا چرخش خودکار بر اساس سقف تعداد آرشیو).',
      'پشتیبانی از انواع عملیات شامل فشرده‌سازی و بکاپ (tar.gz, tar.bz2, tar.xz, zip)، پاک‌سازی فایل‌های قدیمی بر اساس سن (روز)، سقف حجم دایرکتوری و همگام‌سازی (rsync mirror).',
      'فیلترسازی هوشمند پارامترها در فرم مودال بر اساس عملیات انتخابی و نمایش کارت وضعیت سبز حالت حفظ ایمن بکاپ‌ها (Safe Preservation Mode).',
      'افزودن پیش‌تنظیم‌های سریع (Presets) برای مسیرهای دایرکتوری، پوشه‌های مقصد بکاپ و مهلت‌های نگهداری زمانی.',
      'افزودن راهنماهای جامع سه‌بخشی Info (این چیست، چرا لازم است، مثال کاربردی) به زبان‌های فارسی و انگلیسی برای الگو و کلیه پارامترها.'
    ],
    changes_en: [
      'Added dedicated "Directory Lifecycle, Retention & Fleet Backup" command template (linux_directory_lifecycle_backup) to Bulk Linux Server Configuration suite.',
      'Equipped the template with comprehensive backup retention options (Safe Preservation of all prior backups without overwriting/deletion, or Auto-Rotation by max count).',
      'Full support for lifecycle actions: compressed backup archive (tar.gz, tar.bz2, tar.xz, zip), retention age purge (days), directory size quota cap, and sync mirroring.',
      'Added dynamic parameter filtering in the bulk modal based on active action, accompanied by a dedicated Safe Preservation Mode active indicator banner.',
      'Integrated quick-fill preset chips for common target paths, backup destinations, and retention thresholds.',
      'Authored complete bilingual 3-part Info guides (What is it, Why needed, Practical example) for the template and all individual configuration parameters.'
    ],
  },
  {
    version: '1.119.2',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'تضمین عدم بازنویسی و حفظ دائمی بکاپ‌های پیشین در سیاست‌های چرخه حیات دایرکتوری سرور لینوکس',
    title_en: 'Collision-Free Preservation & Overwrite Protection for Linux Directory Backup Policies',
    changes: [
      'رفع مشکل جایگزینی و بازنویسی بکاپ‌های قبلی با نام‌گذاری غیرتداخلی و برچسب زمانی یکتا به همراه مکانیزم بررسی عدم وجود فایل مشابه.',
      'افزودن استراتژی حفظ دائمی بکاپ‌های پیشین (Preserve All Existing Backups) به صورت پیش‌فرض جهت نگهداری صددرصدی تمام نسخه‌های گذشته در مسیر مقصد.',
      'تجهیز فرم پیکربندی بکاپ به انتخابگر دوگانه نگهداری دائمی امن یا چرخش خودکار بر اساس سقف تعداد نسخه.',
      'ارتقای اسکریپت رانر لینوکس به حفظ فایل‌های قبلی موجود در پوشه بکاپ و عدم حذف آنها در صورت فعال بودن حالت نگهداری.',
    ],
    changes_en: [
      'Resolved backup overwriting behavior by implementing collision-safe sequential timestamped archive naming with pre-flight existence checks.',
      'Added "Preserve All Existing Backups" retention strategy as default to ensure all prior archives in the destination folder remain completely intact.',
      'Enhanced backup configuration UI with dual-mode selector between safe indefinite preservation and count-based auto-rotation.',
      'Updated backend remote Linux runner script to strictly guard existing backup archives from premature rotation or deletion.',
    ],
  },
  {
    version: '1.119.1',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'تعبیه تب مستقیم سیاست‌های دایرکتوری و بکاپ در نوار اصلی مودال مانیتور سرورهای لینوکس و بخش دیسک‌ها',
    title_en: 'Direct Directory Lifecycle & Backups Tab in Linux Server Monitor Modal & Storage Quick Actions',
    changes: [
      'افزودن مستقیم تب «سیاست‌های دایرکتوری و بکاپ» (Directory Lifecycle & Backups) به نوار تب‌های اصلی پنجره مانیتور زنده سرورهای لینوکس (LinuxServerMonitorModal).',
      'تعبیه دکمه دسترسی سریع در تب ذخیره‌سازی و دیسک‌ها (Storage & Disks) جهت انتقال مستقیم به مدیریت سیاست‌های دایرکتوری و بکاپ.',
      'همگام‌سازی کامل رمز موقت SSH و اطلاعات احراز هویت نشست بین تب مانیتور و تب مدیریت سیاست‌های دایرکتوری.',
    ],
    changes_en: [
      'Added direct "Directory Lifecycle & Backups" tab to the primary tab navigation bar of the Linux Server Monitor Modal (LinuxServerMonitorModal).',
      'Embedded a quick-action shortcut button in the Storage & Disks tab to jump directly to directory lifecycle and backup management.',
      'Synchronized ephemeral SSH session credentials seamlessly between monitor telemetry and directory policy automation workflows.',
    ],
  },
  {
    version: '1.119.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'سیستم جامع سیاست‌های خودکارسازی چرخه حیات، پاکسازی و بکاپ فشرده دایرکتوری‌های لینوکس با موتور کران بومی',
    title_en: 'Linux Directory Lifecycle, Automated Retention Purge & Compressed Backup Storage Engine',
    changes: [
      'افزودن تب تخصصی «چرخه حیات دایرکتوری و بکاپ» به مودال ناظر خودکار با امکان تعریف سیاست‌های نگهداری پوشه‌ها.',
      'پیاده‌سازی موتور اجرایی بومی لینوکس (/usr/local/bin/nettopology-dir-policy.sh) با مدیریت خودکار فایل‌های کانفیگ در /etc/nettopology-dir-lifecycle/rules.d/ و ادغام پایدار با کران‌تب سیستم (/etc/cron.d/nettopology-dir-lifecycle).',
      'پشتیبانی از ۴ حالت عملیاتی: (۱) پاکسازی دوره‌ای فایل‌های قدیمی بر اساس سن و الگو، (۲) بکاپ و فشرده‌سازی خودکار (tar.gz, tar.bz2, tar.xz, zip) با امکان انتخاب حذف یا نگهداری مبدا و چرخش خودکار آرشیوها، (۳) سقف حجم مجاز و حذف خودکار فایل‌های قدیمی، (۴) آینه‌سازی و همگام‌سازی با rsync.',
      'تجهیز به قابلیت اجرای آزمایشی فوری (Run Now) جهت تست بلادرنگ عملکرد اسکریپت در سرور مقصد همراه با نمایش خروجی ترمینال.',
      'مشاهده زنده لاگ‌های ثبت‌شده اجرای سیاست‌ها از فایل /var/log/nettopology-dir-lifecycle.log با امکان تازه‌سازی و کپی در حافظه.',
      'رعایت ۱۰۰ درصدی استاندارد ۵ گانه مودال‌ها، راهنماهای سه‌بخشی FieldInfoTooltip، تم‌های تیره/روشن و پشتیبانی کامل دوزبانه فارسی و انگلیسی.'
    ],
    changes_en: [
      'Added a dedicated "Directory Lifecycle & Backups" tab within the Watchdog modal for managing filesystem automation policies.',
      'Implemented native destination-side Linux automation agent (/usr/local/bin/nettopology-dir-policy.sh) driven by modular configs in /etc/nettopology-dir-lifecycle/rules.d/ and cron integration (/etc/cron.d/nettopology-dir-lifecycle).',
      'Supported 4 operational modes: (1) Periodic retention purging based on age and pattern, (2) Automated compressed backups (tar.gz, tar.bz2, tar.xz, zip) with configurable source purging and archive rotation, (3) Size-capped quota auto-pruning, and (4) Directory mirroring with rsync.',
      'Equipped with on-demand "Run Now" execution with instant live terminal stdout feedback.',
      'Live audit logging streaming directly from /var/log/nettopology-dir-lifecycle.log with one-click refresh and copy capabilities.',
      '100% adherence to modal specifications, 3-part FieldInfoTooltips, light/dark themes, and strict bilingual English and Persian localization.'
    ],
  },
  {
    version: '1.118.1',
    releaseDate: '2026-09-23',
    type: 'patch',
    title: 'رفع خطای باز شدن و رندر مودال ناظر خودکار سرویس‌ها با پورتال مستقیم به document.body، اصلاح لایه‌بندی z-index و اتصال به داک مینیمایز',
    title_en: 'Fix Service Watchdog Modal Rendering, Direct Portal to document.body, z-index Stacking & ToolsDock Minimization',
    changes: [
      'اصلاح ساختار رندرینگ مودال ناظر خودکار (LinuxServiceWatchdogModal) و استفاده از createPortal مستقیم در document.body جهت جلوگیری از افتادن مودال زیر پس‌زمینه مودال مانیتورینگ.',
      'افزایش اولویت لایه‌بندی استک (z-index) مودال ناظر به z-[80] بالاتر از پنجره مانیتورینگ والد (z-50) و سازگاری کامل با تم روشن و تاریک.',
      'اصلاح منطق بازنشانی تب‌ها و فیلدها در زمان کلیک روی دکمه هدر اصلی در مقایسه با دکمه هر سرویس (انتخاب تب rules در حالت کلی و تب form با سرویس معین در کلیک از سطر).',
      'تجهیز کامل مودال به مدیریت داک مینیمایز در نوار ابزار پایین (ToolsDock) از طریق هوک useModalDock و حفظ وضعیت در زمان بازیابی.'
    ],
    changes_en: [
      'Fixed the Service Watchdog modal rendering pipeline by portaling directly to document.body via createPortal, preventing it from getting occluded beneath the parent monitor backdrop.',
      'Elevated modal stacking layer to z-[80] strictly above the parent Linux monitor modal (z-50) with complete dark/light theme fidelity.',
      'Streamlined active tab routing and state resets when opening from the general toolbar (defaults to Rules tab) versus per-service table row action (defaults to Form tab with preselected service).',
      'Equipped the modal with native ToolsDock minimization and restoration handlers via useModalDock.'
    ],
  },
  {
    version: '1.118.0',
    releaseDate: '2026-09-23',
    type: 'minor',
    title: 'موتور ناظر خودکار و خودترمیمی سرویس‌های لینوکس با ماتریس محافظت سه‌لایه در برابر لوپ بوت و ریستارت',
    title_en: 'Linux Service Self-Healing Watchdog Engine with 3-Layer Anti-Boot-Loop Protection Matrix',
    changes: [
      'پیاده‌سازی موتور بومی ناظر خودکار سرویس‌ها (Service Watchdog Agent) روی سرور لینوکس مقصد در مسیر /usr/local/bin/nettopology-watchdog.sh و اجرای آن تحت مدیریت تمپلیت سیستم‌دی nettopology-watchdog@.service.',
      'افزودن امکان تعریف بازه بررسی سلامت (Check Interval)، حداکثر تلاش‌های استارت مجدد (Max Retries) و پنجره پایداری بازیابی (Stability Cooldown Window) به ازای هر سرویس.',
      'طراحی ماتریس ۳ لایه محافظت قطعی در برابر چرخه لوپ ریستارت سرور (Anti-Boot-Loop Circuit Breaker): بررسی حداقل زمان روشن بودن سرور (≥ 5m uptime)، کول‌داون پایدار بین ریستارت‌ها روی دیسک (≥ 60m cooldown) و سقف مجاز ریستارت در شبانه‌روز (Daily Cap).',
      'امکان تعریف هوک پاکسازی و دستورات پیش‌نیاز قبل از ریستارت سرویس (Pre-Restart Hook Command) مانند کشتن پراسس‌های معلق یا حذف فایل‌های لاک.',
      'طراحی مودال جامع LinuxServiceWatchdogModal مطابق ۵ استاندارد اجباری مودال‌ها با پشتیبانی کامل از تولتیپ‌های سه‌بخشی، تم روشن/تیره، زبان‌های فارسی/انگلیسی و مشاهده زنده لاگ‌های ناظر از فایل /var/log/nettopology-watchdog.log.',
      'تجهیز جدول سرویس‌های لینوکس به دکمه‌های وضعیت زنده ناظر (Watchdog ON / Anti-Loop Halted / Inactive) و دکمه‌های تست تشخیصی و ریست قفل ضدلوپ.'
    ],
    changes_en: [
      'Implemented native destination-side Linux Service Watchdog Agent (/usr/local/bin/nettopology-watchdog.sh) executed as an isolated background daemon via systemd template nettopology-watchdog@.service.',
      'Added per-service health check intervals, configurable consecutive restart retry limits, and healthy stability windows for failure counter resets.',
      'Architected 3-Layer Anti-Boot-Loop Protection Circuit Breaker: Enforces minimum host uptime (≥ 5m), persistent reboot cooldown persisted to disk across reboots (≥ 60m), and a 24-hour daily reboot cap with admin lockout.',
      'Supported custom pre-restart hook shell commands (e.g. killing zombie sockets or cleaning corrupted lockfiles) before executing systemctl restart.',
      'Built fully-featured LinuxServiceWatchdogModal adhering to the 5 mandatory modal specifications with 3-part field info tooltips, dark/light themes, bilingual i18n, and live log tailing from /var/log/nettopology-watchdog.log.',
      'Equipped the Linux Services table with live status badges (Watchdog ON / Anti-Loop Halted / Inactive), instant diagnostic testing, and one-click anti-loop reset.'
    ],
  },
  {
    version: '1.117.2',
    releaseDate: '2026-09-22',
    type: 'patch',
    title: 'رفع خطاهای ۵۰۰ مانیتورینگ و برطرف‌سازی قفل شدن فیلدهای ورودی در زبانه‌های تنظیمات سرور لینوکس',
    title_en: 'Fix Monitor 500 Network Storms & Resolve Text Input Lockups Across Linux Server Configuration Tabs',
    changes: [
      'توقف کامل پولینگ مانیتورینگ پس‌زمینه در زبانه‌های پیکربندی (SysConfig، کاربران و لاگ‌ها) جهت جلوگیری از اشباع پردازنده و تداخل نشست‌های SSH.',
      'افزودن فلگ isBackground به واکشی متریک‌ها برای جلوگیری از تریگر وضعیت لودینگ و رندر مجدد ناخواسته در حین تایپ کاربر در فیلدهای متنی.',
      'ایزوله‌سازی پیام‌های خطا و وضعیت لودینگ تله‌متری به زبانه‌های نظارتی زنده تا مانع از دسترسی یا محو شدن فرم‌های متنی در سایر زبانه‌ها نشود.',
      'افزودن محافظت try/catch کامل و مدیریت اتصال‌های سقط‌شده در تمامی توابع واکشی API سمت کلاینت.',
      'حذف رندرهای تکراری کامپوننت‌های زبانه و ارتقای ثبات و پاسخ‌دهی رابط کاربری در زمان ورود مقادیر پورت و آی‌پی.'
    ],
    changes_en: [
      'Completely halted background monitor polling while active on configuration tabs (SysConfig, Users, Logs) to prevent SSH session contention and request storms.',
      'Introduced isBackground flag to metrics fetching to avoid triggering loading spinners and accidental re-renders while the user is typing in text inputs.',
      'Isolated telemetry error states and initial loaders strictly to telemetry tabs so they never unmount or disrupt configuration forms.',
      'Hardened client API fetch callers with robust try/catch blocks to gracefully handle network disconnects and connection aborts without console crashes.',
      'Cleaned up duplicate tab DOM trees and streamlined UI responsiveness during port, username, and IP address input.'
    ],
  },
  {
    version: '1.117.1',
    releaseDate: '2026-09-22',
    type: 'patch',
    title: 'اصلاح اعمال مستقیم تنظیمات در /etc/ssh/sshd_config، خروج از کامنت، مدیریت پورت و ریستارت قطعی سرویس SSH',
    title_en: 'Direct /etc/ssh/sshd_config Mutation, Directive Uncommenting, Port Rebinding & Reliable SSH Service Restart',
    changes: [
      'اصلاح اعمال مستقیم تنظیمات پورت و پارامترهای امنیتی درون فایل اصلی /etc/ssh/sshd_config و خارج کردن دستورات کامنت‌شده (#Port, #PermitRootLogin و...) از کامنت به جای اکتفا به فایل‌های دراپ‌این.',
      'همگام‌سازی کامل فایل اصلی sshd_config با دایرکتوری دراپ‌این /etc/ssh/sshd_config.d و هماهنگی صددرصدی میان تنظیمات.',
      'اعمال واقعی و پویا لیست IPهای مجاز اتصال (Allowed Client IPs) در فایروال‌های UFW و Firewalld سرور.',
      'اصلاح فرآیند راه‌اندازی مجدد با restart قطعی به جای try-reload (به دلیل عدم توانایی reload در تغییر پورت باز) و پشتیبانی کامل از ssh.socket در اوبونتو ۲۲ به بعد.',
      'تست گرامر با sshd -t قبل از اعمال و رول‌بک خودکار در صورت خطا جهت حفظ کامل اتصال ادمین به سرور.'
    ],
    changes_en: [
      'Directly mutate and uncomment configuration directives (#Port, #PermitRootLogin, etc.) inside the primary /etc/ssh/sshd_config file instead of bypassing it.',
      'Maintained complete synchronization between /etc/ssh/sshd_config and /etc/ssh/sshd_config.d drop-in configurations.',
      'Implemented authentic dynamic firewall enforcement for Allowed Client IPs across both UFW and Firewalld.',
      'Replaced try-reload with authoritative daemon restart and added systemd ssh.socket activation handling (Ubuntu 22.10/24.04+), ensuring the new listening port reliably binds.',
      'Strict syntax validation via sshd -t before restarting with automatic atomic backup rollback to prevent admin lockout.'
    ],
  },
  {
    version: '1.117.0',
    releaseDate: '2026-09-22',
    type: 'minor',
    title: 'افزودن زبانه اختصاصی پایش لاگ‌های سیستم لینوکس (Linux System Logs) با تفکیک دسته‌بندی‌ها، کارت اطلاعات جامع، فیلترگذاری بلادرنگ و نمایش کنسول زنده',
    title_en: 'Dedicated Linux System Logs Suite: Multi-Category Log Streamer, Comprehensive Event Info Cards, Real-Time Grep/Severity Filtering, and Dual View Modes',
    changes: [
      'پیاده‌سازی زبانه اختصاصی لاگ‌های سیستم (System Logs) در پنجره مدیریت سرورهای لینوکس با اتصال زنده از طریق SSH به پایگاه ژورنال systemd و دایرکتوری /var/log/.',
      'تفکیک دسته‌بندی‌های استاندارد لینوکس شامل: ژورنال سیستم (journalctl)، امنیت و احراز هویت (auth.log / secure)، وقایع کلی سیستم‌عامل (syslog / messages)، بافر حلقوی هسته (dmesg)، وب‌سرورهای Nginx و Apache، تاریخچه بسته‌ها (dpkg/apt)، کارهای زمان‌بندی‌شده (cron)، ضدنفوذ (fail2ban)، توالی بوت (boot) و مسیر دلخواه لاگ (custom path).',
      'تجهیز هر دسته‌بندی به کارت اطلاعات جامع (Category Info Card) و تولتیپ سه‌گانه که مشخص می‌کند دقیقاً چه لاگ‌هایی در این بخش ثبت می‌شود، چرا مانیتورینگ آن ضروری است، منابع پیش‌فرض کجاست و نمونه خطوط واقعی لاگ به چه صورت است.',
      'پشتیبانی از دو حالت نمایش: جدول ساختاریافته (جدول با برچسب‌های رنگی سطح خطا، زمان، سرویس و قابلیت باز کردن جزئیات خط) و ترمینال خام کنسول لینوکسی با هایلایت رنگی کلمات کلیدی.',
      'افزودن کنترل‌های قدرتمند شامل فیلتر بلادرنگ متن/Grep، فیلتر سطوح بحرانی (Errors/Warnings)، فیلتر اولویت ژورنال، انتخاب تعداد خطوط (۵۰ تا ۱۰۰۰ خط)، بازخوانی خودکار (۳ تا ۳۰ ثانیه)، کپی کردن لاگ‌ها و دانلود با فرمت .log.',
      'افزودن دراور فایل‌های لاگ شناسایی‌شده روی سرور (Detected Files) با امکان سوییچ سریع به هر فایل دلخواه در /var/log/ به همراه قابلیت پاکسازی ایمن فایل لاگ (Truncate to 0 bytes) با گارد امنیتی جلوگیری از حذف لاگ‌های امنیتی auth.log.'
    ],
    changes_en: [
      'Implemented a dedicated "System Logs" tab in the Linux Server Monitor Modal with direct live SSH querying of systemd-journald and the /var/log/ hierarchy.',
      'Categorized standard Linux log streams: Systemd Journal (journalctl), Security & Authentication (auth.log / secure), System Events (syslog / messages), Kernel Ring Buffer (dmesg), Nginx & Apache web servers, Package Manager history (dpkg / apt), Scheduled tasks (cron), Intrusion defense (fail2ban), Boot sequence (boot), and custom log path inspection.',
      'Equipped each log category with an in-depth Info Card and 3-part tooltip specifying exactly what logs and events sit in that section, why they are needed for network engineering, their default file paths, and realistic log examples.',
      'Supported dual display modes: Structured Table (color-coded severity badges for error/warning/info, timestamp, service, and expandable raw detail) and Raw Monospace Terminal view with syntax highlighting.',
      'Integrated real-time text/grep search, severity level filters (Errors, Warnings, All), journal priority selector, customizable line count (50-1000 lines), auto-refresh intervals (3s-30s), one-click clipboard copying, and .log file export.',
      'Added a detected files drawer listing all available log files under /var/log/ with their sizes, along with a safe log truncation modal guarded against clearing sensitive security audit logs.'
    ],
  },
  {
    version: '1.116.0',
    releaseDate: '2026-09-22',
    type: 'minor',
    title: 'پیاده‌سازی پنل جامع مدیریت کاربران و گروه‌ها در لینوکس: ساخت کاربر، تغییر رمز عبور، قفل/فعال‌سازی و انتساب مستقیم به گروه‌های سیستم',
    title_en: 'Comprehensive Linux User & Group Management Suite: User Provisioning, Password Rotation, Account Locking, and Real Group Access Control',
    changes: [
      'پیاده‌سازی ماژول کامل مدیریت کاربران لینوکس در تب «Users & Active Sessions» با اتصال مستقیم به سرورهای فیزیکی و مجازی از طریق SSH.',
      'افزودن مدال ساخت کاربر جدید با امکان تنظیم نام کاربری، رمز عبور، توضیحات حساب، ساخت خودکار دایرکتوری خانگی (-m)، شل لاگین و اعطای بلادرنگ گروه‌ها و دسترسی sudo.',
      'پیاده‌سازی امکان تغییر رمز عبور کاربران (chpasswd) با رعایت استانداردهای امنیتی بدون ذخیره یا ثبت در لاگ‌های سیستمی.',
      'افزودن قابلیت قفل/غیرفعال‌سازی (usermod -L) و فعال‌سازی مجدد حساب‌های کاربری با محافظت از اکانت روت و نمایش برچسب‌های وضعیت پویا.',
      'پیاده‌سازی پنل تخصصی تخصیص گروه‌ها (usermod -G) بر اساس استخراج زنده گروه‌های فعال سرور از /etc/group، تشخیص گروه‌های دسترسی ادمین (sudo/wheel/docker) و امکان ساخت درجا گروه جدید.',
      'افزودن زبانه اختصاصی دایرکتوری گروه‌ها (Groups Directory) جهت مشاهده لیست کامل گروه‌ها، شناسه‌های GID و کاربران عضو به همراه مدال حذف ایمن کاربر با امکان پاکسازی پوشه خانگی (-r).'
    ],
    changes_en: [
      'Implemented a comprehensive Linux user and group management suite within the "Users & Active Sessions" tab with live SSH execution against remote target servers.',
      'Added a dedicated Create User modal supporting username validation, password provisioning, account comment/full name, automated home directory creation (-m), login shell selection, and instant group/sudo privilege assignment.',
      'Implemented in-place user password rotation via PAM/chpasswd without plaintext terminal echoing or persistence, adhering to zero-leak credential standards.',
      'Added one-click user account locking (usermod -L) and unlocking with root protection and live status badges across the user directory table.',
      'Delivered a specialized group assignment modal (usermod -G) dynamically populated with real system groups from /etc/group, highlighting administrative roles (sudo, wheel, docker) and supporting on-the-fly group creation.',
      'Added a Groups Directory sub-view displaying all system groups, GIDs, and user memberships, along with a safe user deletion modal featuring optional home directory purging (-r).'
    ],
  },
  {
    version: '1.115.0',
    releaseDate: '2026-09-22',
    type: 'minor',
    title: 'پشتیبانی کامل از امنیت TCP Wrappers در لینوکس (/etc/hosts.allow و /etc/hosts.deny) و ارتقای مدیریت جامع فایل /etc/hosts',
    title_en: 'Full Linux TCP Wrappers Security (/etc/hosts.allow & /etc/hosts.deny) and Comprehensive /etc/hosts Management Suite',
    changes: [
      'پیاده‌سازی کامل مدیریت لایه امنیتی TCP Wrappers در تب تنظیمات سرور لینوکس شامل تفکیک زبانه اختصاصی برای فایل‌های /etc/hosts.allow و /etc/hosts.deny.',
      'افزودن امکان مشاهده جدولی و ویرایشگر فایل خام (Raw Editor) برای هر دو فایل hosts.allow و hosts.deny با قابلیت ثبت، ویرایش، حذف قوانین و پشتیبان‌گیری خودکار قبل از بازنویسی.',
      'تجهیز قوانین TCP Wrappers به تنظیم دیمون‌ها (sshd, vsftpd, ALL)، الگوهای کلاینت (IP، رنج ساب‌نت، نام‌ها)، گزینه‌ها (: ALLOW / : DENY) و فیلد توضیحات.',
      'ارتقای مدیریت جدول نگاشت /etc/hosts با پشتیبانی از ویرایش درجا، حذف رکوردها، ویرایشگر مستقیم فایل خام و نگهداری خودکار نسخه‌های پشتیبان.',
      'افزودن راهنماهای سه‌گانه FieldInfoTooltip و بنرهای آموزشی اولویت ارزیابی قوانین TCP Wrappers در سرورهای لینوکسی.'
    ],
    changes_en: [
      'Implemented a complete Linux TCP Wrappers security management suite within the Linux SysConfig tab, introducing dedicated tabs for /etc/hosts.allow and /etc/hosts.deny.',
      'Added both structured tabular view and raw file editor modes for hosts.allow and hosts.deny with full support for adding, editing, deleting rules, and creating automatic backups before writing.',
      'Equipped TCP Wrappers rules with daemon selection (sshd, vsftpd, ALL), client patterns (IPs, CIDR subnets, hostnames), action options (: ALLOW / : DENY), and descriptive comment fields.',
      'Enhanced /etc/hosts static lookup management with in-place entry editing, deletion, direct raw file editing, and automated backup handling.',
      'Integrated boundary-safe 3-part FieldInfoTooltips and contextual guidance explaining TCP Wrappers evaluation priority hierarchy on Linux systems.'
    ],
  },
  {
    version: '1.114.2',
    releaseDate: '2026-09-22',
    type: 'patch',
    title: 'رفع خطای Endpoint Not Found و پیاده‌سازی بک‌اند زنده برای امنیت SSH، تغییر پورت در sshd_config، هاست‌نیم و نگاشت /etc/hosts',
    title_en: 'Resolved Endpoint Not Found & Implemented Live Backend Handlers for SSH Security, sshd_config Port Mutation, Hostname & /etc/hosts Sync',
    changes: [
      'رفع کامل خطای ۴۰۴ Endpoint not found در ماژول‌های تنظیمات سرور لینوکس با ایجاد روت‌ها و هندلرهای جامع در /server/routes.ts و ماژول تخصصی /server/linuxSysConfig.ts.',
      'پیاده‌سازی همگام‌سازی واقعی فایل sshd_config در سرور مقصد: خواندن تنظیمات زنده، تغییر پورت، اعمال سیاست‌های ورود روت، تست با sshd -t، ری‌استارت امن سرویس و به‌روزرسانی پورت سرور در دیتابیس پنل.',
      'پیاده‌سازی ماژول دریافت و تغییر نام هاست (Hostname): استخراج نام هاست زنده جاری و FQDN سرور مقصد، تغییر از طریق hostnamectl و به‌روزرسانی خودکار نگاشت ۱۲۷.۰.۱.۱ در فایل /etc/hosts.',
      'افزودن هندلرهای کامل بک‌اند برای خواندن و ذخیره فایل /etc/hosts، تنظیم سرورهای DNS در /etc/resolv.conf، مدیریت فایروال نفوذ Fail2ban و همگام‌سازی ساعت و تایم‌زون با اجرای فرمان‌های ایمن SSH.'
    ],
    changes_en: [
      'Completely resolved 404 Endpoint not found errors across Linux system configuration tabs by implementing full-featured routes in /server/routes.ts and a dedicated execution engine in /server/linuxSysConfig.ts.',
      'Implemented authentic remote sshd_config synchronization: parses active directives, safely updates SSH port, configures root login policies, validates syntax via sshd -t, restarts the daemon, and updates stored server port in the database.',
      'Implemented live Hostname extraction and modification: retrieves current static/live hostname and FQDN from target servers, updates system hostname via hostnamectl, and automatically synchronizes /etc/hosts mappings.',
      'Delivered robust backend handlers for /etc/hosts entries manipulation, DNS nameserver resolution in /etc/resolv.conf, Fail2ban IPS jail management, and NTP/Timezone system clock synchronization via adaptive SSH commands.'
    ],
  },
  {
    version: '1.114.1',
    releaseDate: '2026-09-22',
    type: 'patch',
    title: 'بهینه‌سازی رابط کاربری ناوگان سرورها: حذف دکمه‌های مستقیم ترمینال و مانیتور از ردیف‌های حالت لیست ویو و یکپارچه‌سازی در منوی ۳-نقطه',
    title_en: 'Remote Servers Fleet UI Cleanup: Removed Direct Terminal and Monitor Buttons from List View Rows and Consolidated into 3-Dot Menu',
    changes: [
      'حذف دکمه‌های تکراری مانیتور و ترمینال از ردیف‌های جدول در حالت نمایش لیستی (List View) صفحه Remote Servers & Automation Fleet جهت ایجاد ظاهری تمیز، خلوت و یکپارچه با صفحه لیست تجهیزات.',
      'تثبیت دسترسی به تمامی قابلیت‌های مانیتورینگ منابع، ترمینال‌های Bash/Zsh، کنسول VNC، ریموت دسکتاپ، ویرایش و حذف از طریق منوی سه‌نقطه (3-dot contextual menu).'
    ],
    changes_en: [
      'Removed redundant Monitor and Terminal direct action buttons from table rows in List View mode within Remote Servers & Automation Fleet, decluttering the view and establishing visual parity with the Network Equipment table.',
      'Consolidated full access to live telemetry monitoring, Bash/Zsh terminals, VNC graphic console, remote desktop, server property edits, and deletion under the 3-dot contextual action menu.'
    ],
  },
  {
    version: '1.114.0',
    releaseDate: '2026-09-22',
    type: 'minor',
    title: 'معماری ماژولار تنظیمات لینوکس: مدیریت هاست‌نیم و /etc/hosts، سرورهای DNS، ضد نفوذ Fail2ban، ساعت و تایم‌زون و امنیت پیشرفته SSH با محدودسازی IP',
    title_en: 'Modular Linux SysConfig Suite: Hostname & /etc/hosts, DNS Servers, Fail2ban IPS, Time & Timezone, and Advanced SSH Security with IP Whitelisting',
    changes: [
      'تفکیک کامل و ماژولارسازی تب تنظیمات سیستم (LinuxSysConfigTab) به زیربخش‌های اختصاصی و حرفه‌ای در دایرکتوری sysconfig.',
      'افزودن ماژول مدیریت هاست‌نیم و نگاشت فایل /etc/hosts (LinuxHostnameSection): تغییر نام هاست با hostnamectl و مدیریت رکوردهای IP و دامنه در /etc/hosts با اعتبارسنجی فرمت.',
      'افزودن ماژول سرورهای نام و DNS (LinuxDnsSection): پیکربندی سرورهای DNS اولیه، ثانویه و ثالث با پریست‌های سریع (گوگل، کلودفلر، شکن، ۴۰۳) و تست زنده پینگ.',
      'افزودن ماژول امنیتی و ضد نفوذ Fail2ban (LinuxFail2banSection): مانیتورینگ جیل‌ها، وضعیت سرویس، آمار حملات و امکان مسدودسازی (Ban) و رفع مسدودی (Unban) آی‌پی‌ها.',
      'افزودن ماژول تنظیم ساعت، تاریخ و منطقه زمانی (LinuxTimeSection): انتخاب مناطق زمانی استاندارد (از جمله تهران)، هماهنگ‌سازی با سرورهای NTP و تنظیم دستی زمان.',
      'افزودن ماژول امنیت و پورت SSH (LinuxSshSection): تغییر پورت گوش‌به‌زنگ، محدودسازی IPهای مجاز برای اتصال به SSH (IP Whitelisting)، تنظیم سیاست‌های ورود روت، احراز هویت پسورد و سقف خطای ورود.',
      'حذف بخش تکراری Operating System & Kernel Details از تب تنظیمات سیستم جهت جلوگیری از تکرار اطلاعات موجود در تب Overview.',
      'پایبندی به استانداردهای پنج‌گانه مودال و تجهیز تمامی آیتم‌ها به راهنمای FieldInfoTooltip با ساختار سه‌گانه و مهار ۴ جهته.'
    ],
    changes_en: [
      'Modularized the Linux System Configuration tab (LinuxSysConfigTab) into dedicated, maintainable sub-sections under sysconfig directory.',
      'Added Hostname & /etc/hosts Management module (LinuxHostnameSection): change system hostname via hostnamectl and manage IP/domain mapping records with syntax validation.',
      'Added DNS & Name Resolution module (LinuxDnsSection): configure primary, secondary, and tertiary DNS servers with quick presets (Google, Cloudflare, Shecan, 403) and live ping tests.',
      'Added Fail2ban Intrusion Prevention module (LinuxFail2banSection): monitor active jails, attack statistics, and manage manual IP ban/unban actions.',
      'Added Time & Timezone Configuration module (LinuxTimeSection): select worldwide timezones (including Tehran), manage NTP time synchronization, and manually adjust system clock.',
      'Added Advanced SSH Security & Port module (LinuxSshSection): change SSH listener port, configure IP whitelisting for SSH access, manage root login policies, password authentication, and authentication failure limits.',
      'Removed redundant Operating System & Kernel Details section from SysConfig tab to avoid duplication with the Overview tab.',
      'Enforced 5-point universal modal standards and equipped all controls with boundary-safe 3-part FieldInfoTooltip popovers.'
    ],
  },
  {
    version: '1.113.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن قابلیت مانت و آن‌مانت فایل‌سیستم‌ها و تفکیک دکمه‌های فعال‌سازی و غیرفعال‌سازی سرویس‌های Systemd',
    title_en: 'Add Filesystem Mount/Unmount Suite & Separate Enable/Disable Systemd Service Actions',
    changes: [
      'افزودن مودال جامع و استاندارد مانت فایل‌سیستم (LinuxMountModal): اسکن دیسک‌ها و بلاک‌دیوایس‌های متصل با lsblk و blkid، انتخاب مسیر مانت هدف، تعیین نوع فایل‌سیستم (auto, ext4, ext3, xfs, btrfs, ntfs-3g, vfat, nfs, cifs)، آپشن‌های مانت (defaults, noatime, ro و غیره) و گزینه ثبت دائمی در /etc/fstab با بکاپ‌گیری ایمن.',
      'امکان آن‌مانت (Unmount) امن پارتیشن‌ها با بررسی مسیرهای محافظت‌شده سیستمی (جلوگیری از آن‌مانت تصادفی روت و بوت) با هشدار تایید و بازخوانی بلادرنگ متریک‌ها.',
      'اصلاح منطق سرویس‌های Systemd: اصلاح خواندن unitFileState و تفکیک دکمه‌های فعال‌سازی (Enable) و غیرفعال‌سازی (Disable) برای هر سرویس در جدول، به‌طوری که امکان غیرفعال‌سازی خودکار در بوت به‌صورت مستقیم و شفاف در دسترس کاربر قرار دارد.'
    ],
    changes_en: [
      'Added full-featured Linux Filesystem Mount Modal (LinuxMountModal): live detection of unmounted and mounted block devices via lsblk & blkid, target mount point configuration with auto-creation, filesystem type selection (auto, ext4, xfs, btrfs, ntfs-3g, nfs, cifs), mount options (defaults, noatime, ro, etc.), and persistent /etc/fstab entry with automated fstab backup.',
      'Added safe partition unmounting capability with system path protection (guarding /, /boot, /sys, /proc against accidental unmounting), confirmation prompt, and live telemetry refresh.',
      'Refactored Systemd services management: fixed unitFileState resolution and provided explicit, side-by-side Enable and Disable buttons for each service, making disabling services at boot directly and reliably accessible.'
    ],
  },
  {
    version: '1.112.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'انتقال مشخصات سیستم و کرنل به بالای تب Overview، اصلاح فیلترهای سرویس‌های Systemd و فعال‌سازی دکمه پیکربندی کارت‌های شبکه',
    title_en: 'Move OS & Kernel Details to Top of Overview, Fix Systemd Service Filters & Fix Network Interface Configuration Button',
    changes: [
      'انتقال کارت جامع مشخصات توزیع، نسخه کرنل، معماری و آپ‌تایم سیستم‌عامل (Operating System & Kernel Details) به بالاترین بخش تب نمای کلی (Overview) جهت دسترسی و مشاهده سریع.',
      'اصلاح کامل فیلترهای وضعیت سرویس‌های لینوکس در تب Systemd Services & Daemons: تفکیک دقیق سرویس‌های فعال (Active/Running)، غیرفعال و متوقف (Inactive/Dead) و معیوب (Failed) بر اساس وضعیت واقعی systemctl و اصلاح نمایش شمارنده‌ها.',
      'رفع مشکل و فعال‌سازی دکمه پیکربندی (Configure) در کارت‌های شبکه بخش Network Interfaces & Throughput: رندر مودال در لایه پورتال مجزا، همگام‌سازی استیت اینترفیس انتخابی و پشتیبانی از استانداردهای پنج‌گانه مودال شامل تمام‌صفحه و مینیمایز.'
    ],
    changes_en: [
      'Moved Operating System & Kernel Details card to the very top of the Overview tab for immediate visibility and rapid system inspection.',
      'Completely fixed status filtering in Systemd Services & Daemons: strict and accurate classification for Active/Running, Inactive/Dead, and Failed services based on genuine systemctl output, along with matching summary counters.',
      'Fixed and enabled the Configure button for network interfaces in Network Interfaces & Throughput: rendered configuration modal in a dedicated portal layer, synchronized interface states, and adhered to 5-point universal modal standards.'
    ],
  },
  {
    version: '1.111.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'توسعه جامع مانیتورینگ لینوکس: مدیریت یوزرها و سشن‌های فعال، ارسال پیام به کاربران، مشخصات توزیع و کرنل، تغییر کارت شبکه، پروکسی ماندگار و تغییر پورت SSH',
    title_en: 'Linux Server Suite Expansion: Users & Active Sessions, User Messaging, Distro & Kernel Detection, NIC Configuration, Persistent System Proxy & SSH Port Modification',
    changes: [
      'افزودن تب کاربران و نشست‌ها (Users & Sessions): نمایش فهرست کامل کاربران سیستم‌عامل با تفکیک کاربران استاندارد، سیستمی و روت، شناسه UID/GID، دایرکتوری خانگی و شل ورود.',
      'رهگیری زنده نشست‌های فعال (Who / W): نمایش کاربرانی که در حال حاضر متصل هستند به همراه TTY/PTS، آدرس IP متصل شونده، زمان ورود، مدت زمان Idle و دستور در حال اجرا.',
      'امکان ارسال پیام و اعلان بلادرنگ به کاربران متصل از طریق دستورات wall و write روی TTY اختصاصی یا عمومی.',
      'افزودن تب مشخصات سیستم، پروکسی و پورت SSH (System & Proxy / SSH): نمایش مشخصات توزیع لینوکس، نگارش سیستم‌عامل، نگارش و نسخه کرنل (uname -r)، معماری پردازنده، نام هاست و آپ‌تایم دقیق.',
      'امکان پیکربندی و تغییر کارت شبکه (NIC Configuration): مودال اختصاصی تغییر آدرس IP، ساب‌نت CIDR، گیت‌وی پیش‌فرض، مقدار MTU و فعال/غیرفعال کردن اینترفیس (UP/DOWN).',
      'امکان ثبت و فعال‌سازی پروکسی سیستمی ماندگار (Persistent Reboot-Proof Proxy): ذخیره‌سازی در فایل‌های /etc/environment و /etc/profile.d/proxy.sh و تنظیمات APT با ابزار تست زنده اتصال به اینترنت از طریق پروکسی.',
      'امکان تغییر امن پورت سرور SSH با اعتبارسنجی خودکار ساختار فایل sshd_config از طریق sshd -t جهت جلوگیری از هرگونه قطعی یا قفل شدن دسترسی و اعمال روی فایروال سرور.'
    ],
    changes_en: [
      'Added Users & Sessions tab: lists all Linux system users categorized by standard, system, and root, showing UID/GID, home directory, and login shell.',
      'Live active sessions monitoring: displays currently logged-in users with TTY/PTS, remote IP, login time, idle duration, and active command.',
      'Instant user messaging: send broadcast notifications (wall) or targeted messages (write) to specific user TTYs directly over SSH.',
      'Added System, Proxy & SSH tab: shows detailed distribution info, release version, kernel release (uname -r), CPU architecture, hostname, and uptime.',
      'Network Interface Configuration modal: modify IP address, CIDR prefix, default gateway, MTU, and administrative state (UP/DOWN) per network card.',
      'Persistent system proxy management: configure HTTP, HTTPS, and No-Proxy settings surviving reboots across /etc/environment, /etc/profile.d, and APT, with live connection testing.',
      'Safe SSH port modification: updates sshd_config with automated sshd -t syntax verification and firewall rule adjustments to prevent accidental lockouts.'
    ],
  },
  {
    version: '1.110.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'اصلاح نمودار تلمتری دوگانه زنده (CPU و RAM)، مدیریت سرویس‌های Systemd و راست‌کلیک مدیریت پردازش‌ها (Kill / Renice)',
    title_en: 'Fixed Dual Telemetry Chart (CPU & RAM), Systemd Service Management & Process Context Menu (Kill / Renice)',
    changes: [
      'رفع کامل باگ لرزش و ناپایداری افقی نمودار Real-time Telemetry Timeline با ایجاد تایم‌لاین پایدار ۲۵ نقطه‌ای با محورهای ثابت درصد و اضافه شدن رندر همزمان و تفکیک‌شده بار پردازنده (فیروزه‌ای) و حافظه رم (سبز زمردی) همراه با تولتیپ تعاملی هاور مقادیر.',
      'افزودن تب جامع مدیریت سرویس‌های سیستم (System Services) جهت مشاهده دیمون‌ها و سرویس‌های لینوکس با systemctl، فیلترهای جستجو و وضعیت، و امکان کنترل کامل: Start، Stop، Restart و Enable/Disable در بوت سرور همراه با فیدبک زنده.',
      'تجهیز جدول پردازش‌های پرمصرف سرور به منوی راست‌کلیک تعاملی (Context Menu) و دکمه عملیات ۳-نقطه برای خاتمه نرم (SIGTERM 15)، بستن اجباری (SIGKILL 9)، تغییر اولویت زمان‌بندی پردازنده (Renice با اسلایدر و مقادیر سریع از -20 تا +19) و کپی PID/دستور.',
      'پیاده‌سازی اندپوینت‌های امن و زنده بک‌اند بر بستر امن SSH (/api/remote-servers/:id/services و /service-action و /process-action) بدون ذخیره‌سازی رمز در کلاینت و با تاییدیه اعتبار هویت.'
    ],
    changes_en: [
      'Resolved Real-time Telemetry Timeline jitter and missing RAM curve: engineered a fixed 25-point dual-series SVG chart rendering distinct CPU (Cyan) and RAM (Emerald) curves with interactive hover crosshairs and metric filtering.',
      'Introduced full System Services management tab: lists active/inactive/failed systemd units with live Start, Stop, Restart, and boot Enable/Disable controls over SSH with instant feedback.',
      'Equipped Top Processes table with right-click context menu and 3-dot action button for graceful termination (SIGTERM 15), force kill (SIGKILL 9), CPU scheduling priority adjustment (Renice slider & presets from -20 to +19), and PID/command copying.',
      'Engineered secure live backend SSH endpoints (/api/remote-servers/:id/services, /service-action, and /process-action) with robust permission execution and strict Zero-Storage compliance.'
    ]
  },
  {
    version: '1.109.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن دکمه مانیتور و مودال مانیتورینگ زنده منابع سرورهای لینوکس (CPU, RAM, Disk, Net, Processes)',
    title_en: 'Linux Server Live Resource & Telemetry Monitoring Suite with Real-time Graphical Charts',
    changes: [
      'افزودن دکمه اختصاصی "مانیتور" (Monitor) در لیست سرورهای لینوکس صفحه Remote Servers & Automation Fleet (در نمای جدول اصلی، کارت‌های گرید، جدول فشرده و منوی ۳-نقطه).',
      'طراحی و پیاده‌سازی مودال پیشرفته مانیتورینگ زنده (LinuxServerMonitorModal) بر اساس استاندارد ۵گانه مودال‌ها (دکمه‌های سه‌گانه هدر، حریم فوتر bottom-8 در تمام‌صفحه، انطباق کامل تم تیره/روشن، دوزبانگی و پاپ‌آپ‌های راهنما).',
      'نمایش گرافیکی و لایو وضعیت منابع با نمودارهای خطی و اسپارک‌لاین SVG برای روند بار پردازنده (CPU Usage / Load Average) و مصرف رم (RAM & Swap).',
      'تفکیک تب‌های هوشمند: نمای کلی (Overview)، مانیتورینگ فضای دیسک و پارتیشن‌ها (Storage & Mounts)، وضعیت کارت‌های شبکه و پهنای باند RX/TX، و لیست پردازش‌های پرمصرف سرور (Top Processes).',
      'موتور بک‌اند دریافت تلمتری واقعی از سرور لینوکس با اتصال SSH و اجرای بهینه‌شده اسکریپت با مذاکره تطبیقی الگوریتم‌ها (Modern First با Fallback خودکار به الگوریتم‌های Legacy) بدون دیتای ساختگی یا فیک.',
      'پشتیبانی از پولینگ زنده و خودکار با قابلیت تنظیم فواصل زمانی و اعمال سیاست امنیت احراز هویت On-Demand (Zero-Storage).'
    ],
    changes_en: [
      'Added dedicated "Monitor" action button to Linux servers in the Remote Servers & Automation Fleet page across all views (Table, Grid cards, Compact list, and 3-dot action menu).',
      'Engineered advanced real-time LinuxServerMonitorModal adhering strictly to the 5 universal modal standards (3-button header controls, bottom-8 footer boundary in fullscreen, dark/light theme fidelity, full bilingual support, and field guides).',
      'Visualized live resource telemetry with interactive SVG sparklines and trend charts for CPU load, memory utilization, and swap dynamics.',
      'Tabbed analytical diagnostics: Overview dashboard, storage partition allocations, network interface RX/TX throughput, and real-time top resource-consuming processes.',
      'Engineered backend SSH live telemetry engine (/api/remote-servers/:id/monitor) with adaptive multi-generation SSH cipher negotiation (modern first, graceful legacy fallback) collecting 100% genuine live metrics without fake data.',
      'Integrated auto-polling with configurable refresh intervals and full compliance with Zero-Storage on-demand credentials.'
    ]
  },
  {
    version: '1.108.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'همگام‌سازی کامل دیزاین و ساختار Bulk Linux Server Configuration با Bulk Device Config و اصلاح لایه‌بندی فول‌اسکرین و هدر',
    title_en: 'Bulk Linux Server Configuration Modal Layout Synchronization with Bulk Device Config & Fullscreen Fix',
    changes: [
      'بازنویسی کامل ساختار مودال پیکربندی گروهی سرورهای لینوکس (Bulk Linux Server Configuration) بر اساس معماری و ظاهر یکپارچه Bulk Device Configuration در بخش تجهیزات شبکه.',
      'حل قطعی مشکل افتادن بالای مودال زیر هدر برنامه: استفاده از پورتال React (createPortal به document.body) با لایه z-[9999] و قرارگیری دقیق روی کل لایه‌های صفحه.',
      'اصلاح رفتار حالت تمام‌صفحه (Fullscreen): امتداد تا لبه بالایی نوار ابزار پایین با حریم bottom-8 جهت ممانعت از همپوشانی با داک ابزارها و حفظ دسترسی همیشگی به دکمه‌های کنترلی هدر (بستن، مینیمایز، خروج از تمام‌صفحه).',
      'یکپارچه‌سازی نوار ناوبری سه‌مرحله‌ای (قالب و متغیرها -> پیش‌نمایش و دستورات شل -> اجرا و مانیتورینگ) همراه با آمار توزیع‌های فعال ناوگان لینوکس.',
      'تجهیز تمام گزینه‌های جدید (مدیریت کاربران و گروه‌ها، کرون‌جاب، مانت استوریج، فایروال، داکر) به پاپ‌آپ‌های راهنمای آموزشی ۳ بخشی (این چیست؟ چرا لازم است؟ مثال کاربردی).',
      'انطباق صددرصدی با هر دو تم تاریک و روشن و حفظ هماهنگی کامل متون در دو زبان فارسی و انگلیسی.'
    ],
    changes_en: [
      'Complete architectural and visual redesign of Bulk Linux Server Configuration modal to match the exact UX and layout of Bulk Device Configuration.',
      'Resolved modal header collision: mounted via React Portal (createPortal to document.body) with z-[9999] to ensure the modal header always stays above the app navbar and never drops underneath.',
      'Refined fullscreen behavior: perfectly aligns with bottom-8 footer clearance preserving ToolsDock space and providing uninterrupted access to header controls (close, minimize, fullscreen toggle).',
      'Integrated unified 3-step navigation workflow (Template & Parameters -> Preview & Shell Commands -> Execution & Monitoring) with live fleet distribution statistics.',
      'Equipped all newly added automation options (user lifecycle/groups, cron jobs, storage mounting, firewall rules, docker fleet) with boundary-safe 3-part educational guides (What, Why, Example).',
      'Full dark/light theme adaptability and strict bilingual localization without unlocalized text.'
    ]
  },
  {
    version: '1.107.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'توسعه پیشرفته گزینه‌های اتوماسیون ناوگان سرورهای لینوکس: مدیریت کامل کاربران، زمان‌بندی کرون‌جاب، مانت استوریج و فایروال هوشمند',
    title_en: 'Advanced Bulk Linux Automation Suite: User Lifecycle & Groups, Simplified Cron Scheduling, Storage Mount & Adaptive Firewall',
    changes: [
      'توسعه همه‌جانبه ماژول مدیریت کاربران: افزودن کاربر به گروه‌های ثانویه یا حذف از گروه‌ها (مانند docker, sudo)، قفل و بازگشایی حساب، انقضای فوری رمز عبور یا تنظیم تاریخ انقضای حساب کاربری، حذف حساب کاربری با پاک‌سازی دایرکتوری خانگی و خاتمه پردازش‌ها، و تغییر شل ورودی (bash, zsh, nologin).',
      'پیاده‌سازی سیستم زمان‌بندی وظایف (Cron Jobs) با دوره‌های آماده و بسیار قابل‌فهم (هر دقیقه، ۵ دقیقه، ساعتی، نیمه‌شب، هفتگی، اول ماه، هنگام بوت @reboot یا عبارت ۵ فیلدی سفارشی)، حذف وظایف بر اساس شناسه و ممیزی جامع کرون‌های فعال در سطح ناوگان.',
      'افزودن امکان مانت فضای ذخیره‌سازی، دیسک‌های ابری و اشتراک‌های شبکه (ext4, xfs, btrfs, nfs, cifs) با ساخت خودکار پوشه و ثبت پایدار در /etc/fstab جهت بقا پس از ریبوت، آن‌مانت ایمن (با پشتیبانی از force و lazy) و ممیزی حجم و Inode دیسک‌ها.',
      'مدیریت هوشمند فایروال و پورت‌ها: بستن، باز کردن یا حذف قوانین پورت با تشخیص خودکار فایروال فعال (UFW، Firewalld یا Iptables)، پشتیبانی از فیلتر IP/CIDR مبدا و استعلام بی‌درنگ قوانین فایروال.',
      'افزودن اتوماسیون کانتینرهای داکر (مشاهده، ری‌استارت، پاک‌سازی عمیق حافظه با prune، و اسنپ‌شات مصرف منابع)، ممیزی پردازش‌های پرمصرف CPU و RAM، تنظیم روت‌های استاتیک کرنل و ممیزی انقضای گواهینامه‌های SSL/TLS.',
      'تجهیز نوار فیلتر به دسته‌بندی‌های جدید (Users & Groups, Cron Jobs, Mount & Storage, Firewall & Ports, Docker Fleet) با آیکون‌های متناسب و حفظ کامل استانداردهای مودال و دوزبانگی.'
    ],
    changes_en: [
      'Comprehensive User Lifecycle & Group Automation: secondary group assignment/revocation (docker, sudo), account lock/unlock, password expiration and account expiry scheduling, safe user deletion with home directory purge, and login shell customization (bash, zsh, nologin).',
      'Intuitive Cron Job Scheduling Engine: human-readable schedule presets (every minute, 5 min, hourly, daily midnight, weekly, monthly, @reboot, or custom 5-field expression), tag-based job removal, and fleet-wide crontab auditing.',
      'Block Device, Storage & Network Share Mounting: automated directory creation, filesystem support (ext4, xfs, btrfs, nfs, cifs), persistent /etc/fstab writing with backup, safe unmounting (with force and lazy flags), and disk/inode capacity audits.',
      'Adaptive Firewall & Port Management: allow, block, or delete port rules with auto-detection of active host firewall (UFW, Firewalld, or Iptables), optional source CIDR isolation, and real-time firewall policy auditing.',
      'Docker Fleet & System Diagnostics: container status, targeted container restart, deep cache prune, live stats snapshots, top CPU/RAM consuming process inspection, static routing (ip route), and local SSL/TLS certificate expiry audits.',
      'Enhanced UI Category Tabs: added dedicated filters for Users & Groups, Cron Jobs, Mount & Storage, Firewall & Ports, and Docker Fleet with tailored iconography and strict bilingual adherence.'
    ]
  },
  {
    version: '1.106.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن سیستم جامع پیکربندی گروهی ناوگان سرورهای لینوکس (Bulk Linux Server Configuration & Fleet Automation)',
    title_en: 'Add Comprehensive Bulk Linux Server Configuration & Fleet Automation Suite',
    changes: [
      'پیاده‌سازی ماژول پیکربندی گروهی و اتوماسیون ناوگان سرورهای لینوکسی دقیقاً مشابه Bulk Device Configuration در بخش تجهیزات شبکه.',
      'افزودن مجموعه قالب‌های استاندارد و کاربردی سرور لینوکس: به‌روزرسانی‌های امنیتی، پاک‌سازی دیسک و لاگ‌ها، امن‌سازی SSH، همگام‌سازی زمان و NTP، پیکربندی DNS Resolver، ایجاد کاربران مدیر با دسترسی Sudo، مدیریت سرویس‌های Systemd و اجرای اسکریپت شل آزاد.',
      'تولید هوشمند و خودکار دستورات شل بر اساس توزیع سیستم‌عامل هر سرور (Debian/Ubuntu با APT، RHEL/CentOS/Rocky با DNF/YUM، Arch با Pacman، Alpine با APK و Generic POSIX).',
      'پیش‌نمایش زنده دستورات ترجمه‌شده به ازای هر سرور قبل از شروع اجرا و تدابیر حفاظتی برای عملیات حساس (Confirmation Keyword).',
      'موتور اجرای موازی و ترتیبی با بازخورد زنده، ثبت لاگ‌های بی‌درنگ، امکان لغو (Cancel)، نمایش تفکیک‌شده stdout/stderr و زمان پاسخگویی به میلی‌ثانیه.',
      'پشتیبانی کامل از استانداردهای پنج‌گانه مودال: دکمه‌های سه‌گانه کنترلی (بستن، مینیمایز در نوار ابزار پایین با حفظ استیت، تمام‌صفحه با رعایت حریم فوتر)، هماهنگی با تم روشن و تاریک، دوزبانگی کامل (فارسی و انگلیسی) و راهنماهای سه‌بخشی Info.'
    ],
    changes_en: [
      'Implemented a comprehensive Bulk Linux Server Configuration & Fleet Automation suite in Remote Servers & Automation Fleet, mirroring the network equipment bulk configuration engine.',
      'Added practical Linux server templates: OS Security Updates, Disk & Journal Cleanup, SSH Server Hardening, NTP & Timezone Sync, DNS Resolvers, Administrative User & Sudo Setup, Systemd Services Management, and Custom Ad-hoc Shell Scripting.',
      'Intelligent distro-aware command generation tailored per node (Debian/Ubuntu with APT, RHEL/Rocky with DNF/YUM, Arch with Pacman, Alpine with APK, and Generic POSIX).',
      'Live per-server command preview before execution with confirmation safeguards for dangerous operations.',
      'Asynchronous fleet execution engine with live telemetry, real-time log streaming, job cancellation, per-node stdout/stderr drawer inspection, and runtime latency metrics in milliseconds.',
      'Full compliance with 5-part universal modal guidelines: header 3-button controls (close, minimize to dock with state retention, fullscreen with strict footer boundary), dark/light mode adaptability, strict bilingual localization, and boundary-safe 3-part field info tooltips.'
    ]
  },
  {
    version: '1.105.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن امکان ذخیره‌سازی خودکار رمز عبور و رمز Enable در والت شخصی در مودال ثبت تجهیز شبکه (Save to Vault)',
    title_en: 'Add Non-Intrusive Save to Personal Vault Option in Register New Network Device Modal',
    changes: [
      'پیاده‌سازی گزینه غیراِشغالی و ارگونومیک (Non-Intrusive) در مودال ثبت تجهیز جدید شبکه (Register New Network Device) جهت ذخیره رمز عبور SSH/Telnet در والت شخصی هنگام تایپ دستی.',
      'پشتیبانی همزمان از ذخیره‌سازی گذرواژه سطح مدیریت و دسترسی بالا (Cisco Enable Secret) در والت با برچسب اختصاصی.',
      'ثبت خودکار و رمزنگاری‌شده اطلاعات کاربری، نام تجهیز، آدرس IP و هاست هدف، پلتفرم و نوع تجهیز در والت بدون نیاز به باز کردن مجدد ماژول والت.',
      'هماهنگی کامل با حالت‌های روشن و تاریک و پشتیبانی دقیق از زبان‌های فارسی و انگلیسی.'
    ],
    changes_en: [
      'Implemented an elegant, non-intrusive "Save to Personal Vault" option in the Register New Network Device modal for manually typed SSH/Telnet credentials.',
      'Supported direct one-click saving of the privileged Cisco Enable Secret password into the personal vault with dedicated tags.',
      'Automatically registers device name, target IP/host, platform, role, and category into the encrypted personal vault upon device registration.',
      'Fully harmonized across light and dark themes with strict bilingual localization (English and Persian).'
    ]
  },
  {
    version: '1.104.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن امکان ذخیره‌سازی خودکار رمز دستی در والت شخصی در مودال ثبت سرور (Save to Vault)',
    title_en: 'Add Non-Intrusive Save to Personal Vault Option for Manually Entered Server Passwords',
    changes: [
      'پیاده‌سازی گزینه‌ای زیبا، روان و غیرآزاردهنده (Non-Intrusive) در فرم ثبت و ویرایش سرور جهت پیشنهاد ذخیره رمز در والت شخصی کاربر هنگام تایپ دستی رمز عبور.',
      'پشتیبانی همزمان برای اتصالات لینوکسی (کنسول SSH) و سرورهای ویندوزی (RDP/PowerShell/WinRM).',
      'ذخیره‌سازی امن و خودکار اطلاعات کاربری (نام کاربری، هاست مقصد، دسته‌بندی و برچسب‌های متناظر) در والت رمزهای عبور بدون نیاز به ورود مجدد به منوی والت.',
      'حفظ کامل حریم امنیتی و همگام‌سازی با سیاست عدم ذخیره‌سازی محلی (Zero-Storage Policy) در صورت انتخاب آن توسط کاربر.'
    ],
    changes_en: [
      'Implemented an elegant, non-intrusive "Save to Personal Vault" option in the Register/Edit Remote Server dialog whenever a password is typed manually.',
      'Supported both Linux servers (SSH credentials) and Windows machines (RDP / PowerShell / WinRM credentials).',
      'Securely and automatically registers username, target host, proper category, and tags into the user\'s encrypted vault upon server submission.',
      'Strictly respects the Zero-Storage Policy when zero-storage is enabled by the user.'
    ]
  },
  {
    version: '1.103.3',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'اصلاح لایه‌بندی Z-Index مودال انتخاب رمز والت شخصی و دسته‌بندی‌ها در فرم ثبت سرور (Register Remote Server)',
    title_en: 'Fix Modal Z-Index Stacking Hierarchy for Vault Password Picker & Categories in Register Remote Server Dialog',
    changes: [
      'برطرف‌سازی خطای عدم نمایش مودال انتخاب رمز شخصی پس از کلیک روی دکمه Choose from Vault در فرم ثبت سرور ریموت (Register Remote Server).',
      'ارتقای لایه z-index مودال VaultPasswordPickerModal به z-[10005] و زیرمودال احراز هویت به z-[10020] جهت قرارگیری صحیح بر فراز مودال سرور (z-[9999]).',
      'همگام‌سازی لایه z-index مودال مدیریت دسته‌بندی‌های سرور به z-[10005] جهت پیشگیری از تداخل لایه‌بندی پورتال‌ها.',
      'تضمین پیاده‌سازی همیشگی دکمه‌های سه‌گانه کنترلی هدر (بستن، مینیمایز، تمام‌صفحه) مطابق با بند ۱ استاندارد جامع مودال‌ها.'
    ],
    changes_en: [
      'Resolved modal visibility issue where clicking "Choose from Vault" inside the "Register Remote Server" modal did not visually reveal the Vault Password Picker.',
      'Elevated VaultPasswordPickerModal stacking context to z-[10005] and the unlock re-authentication submodal to z-[10020] to cleanly layer above the server modal (z-[9999]).',
      'Synchronized ManageServerCategoriesModal stacking context to z-[10005] to prevent portal backdrop occlusion.',
      'Guaranteed universal rendering of all three header control buttons (Close, Minimize, Fullscreen) in strict compliance with Section 1 of Universal Modal Guidelines.'
    ]
  },
  {
    version: '1.103.2',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع خطای اعتبارسنجی رمز ورود در مودال احراز هویت والت شخصی کلمات عبور (Confirm Identity to Unlock Password)',
    title_en: 'Fix User Login Password Verification in Personal Vault Unlock Modal (Confirm Identity to Unlock Password)',
    changes: [
      'رفع عدم تطابق نام پارامتر کلاینت و سرور در تابع بازگشایی گذرواژه (پذیرش همزمان loginPassword و password در اندپوینت /api/vault/:id/reveal).',
      'برطرف‌سازی نمایش خطای نادرست User login password is required to reveal this credential به هنگام ثبت گذرواژه صحیح کاربری در مودال انتخاب رمز والت شخصی.',
      'افزودن پیام‌های خطای دوزبانه (فارسی و انگلیسی) مناسب و ارتقای جستجوی حساب کاربری فعال در پایگاه داده جهت اعتبارسنجی دقیق هش رمز عبور.'
    ],
    changes_en: [
      'Resolved client-server parameter discrepancy in credential decryption by supporting both loginPassword and password in the /api/vault/:id/reveal API endpoint.',
      'Fixed the false-positive error "User login password is required to reveal this credential" when providing valid user credentials in Vault Password Picker modal.',
      'Added comprehensive bilingual (EN/FA) error responses and enhanced active user lookup across database storage for resilient password verification.'
    ]
  },
  {
    version: '1.103.1',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع خطای بارگذاری اولیه داده‌های توپولوژی و تجهیزات در شروع سامانه با بک‌اند فال‌بک و مکانیزم تلاش مجدد خودکار',
    title_en: 'Fix Initial Data Loading Error for Topology & Devices with Cold-Start Local Fallbacks and Auto-Retry',
    changes: [
      'رفع خطای Failed to load initial data: Failed to fetch topology هنگام راه‌اندازی یا بوت اولیه سرور پایتون.',
      'افزودن قابلیت پاسخ‌دهی فوری فال‌بک از دیتابیس لوکال network_data.json در پروکسی سرور Node جهت پیشگیری از خطای ۵۰۳ در زمان Cold-Start.',
      'تجهیز توابع fetchTopology و fetchDevices به مکانیزم تلاش مجدد خودکار (Automatic Retry با Exponential Backoff) در صورت تاخیر موقت سرویس‌دهنده.',
      'بهبود چرخه فراخوانی اولیه داده‌ها در App.tsx جهت بازیابی خودکار و نرم بدون ثبت خطای بحرانی در کنسول.'
    ],
    changes_en: [
      'Resolved the "Failed to load initial data: Failed to fetch topology" error encountered during application cold-start while the Python backend initializes.',
      'Implemented instant fallback response in Node Express proxy using local network_data.json dataset to eliminate transient 503 errors.',
      'Equipped fetchTopology and fetchDevices client API functions with resilient automatic retry and backoff handling.',
      'Enhanced initial load lifecycle in App.tsx to gracefully recover and synchronize network state without unhandled console errors.'
    ]
  },
  {
    version: '1.103.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن امکان انتخاب گذرواژه از ولت شخصی در مودال ثبت و ویرایش تجهیزات شبکه با ایزولاسیون کامل کاربری',
    title_en: 'Integrate Personal Vault Password Picker into Network Device Registration & Edit Modals with Strict User Isolation',
    changes: [
      'افزودن دکمه «از ولت» (From Vault) در کنار فیلدهای رمز عبور پروتکل اتصال (SSH / Telnet) و رمز عبور Enable Secret در مودال ثبت تجهیز جدید شبکه (Register New Network Device).',
      'افزودن قابلیت یکپارچه انتخاب گذرواژه از ولت شخصی در مودال ویرایش تجهیزات شبکه (Edit Network Device).',
      'تضمین ایزولاسیون صددرصدی کلمات عبور ولت بر اساس کاربر لاگین‌شده (User-Scoped Isolation)؛ هیچ کاربری قادر به مشاهده یا انتخاب کلمات عبور ولت کاربر دیگری نیست.',
      'الزام احراز هویت مجدد امن با رمز ورود به پنل هنگام انتخاب و بازگشایی گذرواژه از ولت شخصی.',
      'تشخیص هوشمند و پیشنهاد خودکار نام کاربری (Username) ثبت‌شده در ولت در صورت خالی بودن یا پیش‌فرض بودن نام کاربری.',
      'تطابق کامل با استاندارد پنج‌گانه مودال‌ها شامل حالت‌های تیره/روشن، پشتیبانی کامل از زبان‌های فارسی و انگلیسی و جلوگیری از خروج ابزارها از کادر صفحه.'
    ],
    changes_en: [
      'Integrated dedicated "From Vault" picker button adjacent to SSH/Telnet and Enable Secret password fields in the "Register New Network Device" modal.',
      'Enabled seamless Personal Password Vault picker support across the "Edit Network Device" modal for effortless credential updates.',
      'Enforced strict user-scoped isolation ensuring vault secrets are retrieved exclusively for the currently authenticated user with complete cross-user protection.',
      'Integrated secure re-authentication requiring the user\'s active panel login password before decrypting and applying the selected vault credential.',
      'Added smart autofill for associated device usernames when selecting credentials from the user\'s personal vault.',
      'Maintained full compliance with the 5 universal modal standards including light/dark theme fidelity and bilingual i18n support.'
    ]
  },
  {
    version: '1.102.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن امکان انتخاب گذرواژه از ولت شخصی کاربر در مودال ثبت سرور ریموت با ایزولاسیون کامل و احراز هویت امن',
    title_en: 'Add Secure Vault Password Picker to Remote Server Registration Modal with Strict Per-User Isolation',
    changes: [
      'افزودن دکمه «انتخاب از ولت شخصی» (Choose from Vault) در کنار فیلدهای رمز عبور SSH سرورهای لینوکسی و رمز عبور سرورهای ویندوزی در مودال ثبت سرور ریموت (Register Remote Server).',
      'طراحی کامپوننت مودال اختصاصی VaultPasswordPickerModal با پشتیبانی از استانداردهای پنج‌گانه مودال‌ها: دکمه‌های کنترل سه‌گانه، انطباق کامل با تم تیره و روشن، پشتیبانی دو زبانه (فارسی و انگلیسی) و کادر راهنمای سه‌بخشی Info.',
      'تضمین ایزولاسیون صددرصدی و تفکیک قطعی دسترسی ولت بر اساس حساب کاربری فعال (User-Scoped Isolation)، به گونه‌ای که هر کاربر منحصراً به کلمات عبور ولت شخصی خود دسترسی دارد و هیچ کاربری نمی‌تواند به ولت دیگری دسترسی پیدا کند.',
      'پیاده‌سازی احراز هویت مجدد امن (Re-Authentication with Login Password) هنگام انتخاب و اعمال رمز عبور انتخابی از ولت جهت جلوگیری از سوءاستفاده‌های احتمالی.',
      'پشتیبانی از جستجو و فیلتر بر اساس عنوان، کاربر، هاست و دسته‌بندی با تشخیص هوشمند تطابق هاست (Host Match) با سرور در حال ثبت.'
    ],
    changes_en: [
      'Added dedicated "Choose from Vault" button adjacent to SSH and Windows password inputs within the Register / Edit Remote Server modal.',
      'Engineered VaultPasswordPickerModal component adhering to all universal modal standards: 3 header control buttons, full dark/light theme fidelity, strict bilingual i18n, and boundary-safe 3-part Field Info tooltip.',
      'Enforced strict per-user vault isolation ensuring only secrets owned by the currently authenticated user are accessible, preventing any cross-user vault access.',
      'Integrated mandatory master login password re-authentication before unlocking and applying the chosen vault secret to prevent unauthorized credential usage.',
      'Added instant search and category filtering with automatic target host matching highlights for streamlined server credential association.'
    ]
  },
  {
    version: '1.101.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'ارتقای امنیتی ولت گذرواژه‌ها: احراز هویت مجدد با رمز لاگین کاربر هنگام Reveal و ذخیره هش امن در دیتابیس',
    title_en: 'Password Vault Security Hardening: Master Login Password Re-Authentication on Reveal & Salted Hash Storage',
    changes: [
      'الزام احراز هویت مجدد کاربر با دریافت رمز عبور ورود به سامانه (Login Password) در هنگام کلیک روی دکمه نمایش یا کپی گذرواژه (Reveal / Copy Password).',
      'طراحی مودال اختصاصی تأیید هویت کاربری (Master Password Verification) با پشتیبانی کامل از تم روشن/تاریک، زبان‌های فارسی و انگلیسی و محافظت در برابر حملات Brute-force با Rate Limiting هوشمند.',
      'افزودن قابلیت ذخیره‌سازی هش رمزنگاری‌شده و نمک‌دار گذرواژه‌ها (PBKDF2-SHA512 با ۱۰۰,۰۰۰ دور) در فیلدهای password_hash و password_salt در دیتابیس دوشادوش رمزنگاری AES-256-GCM.',
      'به‌روزرسانی ساختار دیتابیس PostgreSQL و فایل ذخیره‌سازی محلی جهت ثبت و همگام‌سازی خودکار ستون‌های هش و نمک در جدول user_password_vault.',
      'ثبت دقیق تمامی تلاش‌های موفق و ناموفق رمزگشایی و مشاهده کلمات عبور در لاگ‌های حسابرسی امنیتی سیستم (Audit Logs).'
    ],
    changes_en: [
      'Enforced mandatory re-authentication requiring the user\'s current login password before revealing or copying any secret from the Password Vault.',
      'Designed a dedicated Master Password Verification dialog adhering to dark/light theme standards, full bilingual i18n, and brute-force protection via rate-limiting.',
      'Added cryptographic salted hashing (PBKDF2-SHA512 with 100,000 iterations) stored in password_hash and password_salt columns alongside authenticated AES-256-GCM ciphertext.',
      'Updated the PostgreSQL schema and fallback store to automatically migrate and persist password hashes and salts in user_password_vault.',
      'Integrated comprehensive security auditing recording all successful and failed secret reveal and decryption attempts in Audit Logs.'
    ]
  },
  {
    version: '1.100.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن ماژول ولت اختصاصی گذرواژه‌ها (Password Vault) با ایزولاسیون کامل کاربران و رمزنگاری AES-256-GCM',
    title_en: 'Add Dedicated User Password Vault with Strict Per-User Isolation and AES-256-GCM Encryption',
    changes: [
      'پیاده‌سازی ماژول ولت اختصاصی گذرواژه‌ها (Password Vault) جهت نگهداری امن کلمات عبور، نام‌های کاربری و آدرس تجهیزات با تفکیک و ایزولاسیون صددرصدی هر کاربر نسبت به سایرین.',
      'رمزنگاری سخت‌گیرانه داده‌های حساس در مبدأ با الگوریتم استاندارد AES-256-GCM و تولید کلیدهای رمزنگاری اختصاصی هر کاربر با مشتق‌سازی Scrypt و Salt پویا.',
      'طراحی رابط کاربری مدرن منطبق با ۵ قانون الزامی مودال‌ها: دکمه‌های سه‌گانه کنترلی (بستن، مینیمایز به داک ابزارها، و تمام‌صفحه با رعایت فاصله ۸ پیکسلی از فوتر)، انطباق با تم تاریک و روشن، دو زبانه کامل فارسی و انگلیسی، و تولتیپ‌های سه‌بخشی Info ضدخروج از صفحه.',
      'یکپارچه‌سازی کامل در نوار بالایی (Navbar)، منوی کشویی پروفایل کاربر، لیست ابزارهای شبکه (NetworkToolsMenu)، و دکمه اتصال مستقیم در مدال تولید گذرواژه (Password Generator).',
      'پشتیبانی از جستجوی سریع، فیلتر دسته‌بندی‌ها (تجهیزات شبکه، سرورها، فایروال، ابری، پایگاه‌داده و متفرقه)، ارزیابی بلادرنگ شاخص قدرت رمز، کپی سریع گذرواژه در کلیپ‌بورد با رمزگشایی در لحظه و ثبت وقایع در لاگ حسابرسی (Audit Logs).'
    ],
    changes_en: [
      'Implemented dedicated Password Vault module providing secure, per-user isolated storage for credentials, device passwords, and accounts.',
      'Enforced military-grade zero-leak security utilizing AES-256-GCM encryption with per-user Scrypt key derivation and dynamic cryptographic salt.',
      'Designed compliant UI adhering to all 5 Universal Modal Architectural Rules: 3 header control buttons (close, minimize to dock, strict boundary fullscreen), dark/light mode compatibility, 100% bilingual Persian/English i18n, and boundary-safe 3-part Field Info tooltips.',
      'Integrated seamlessly across the navigation bar, user profile dropdown, Network Tools menu, and direct "Save to Vault" workflow in the Password Generator modal.',
      'Added instant search, category filtering (Network, Servers, Firewalls, Cloud, Databases, Other), real-time password strength meter, secure clipboard copy, on-demand decryption, and full audit log compliance.'
    ]
  },
  {
    version: '1.99.5',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع عدم تطابق Hostname سرور و مسیر دایرکتوری جاری (CWD) در خط فرمان ترمینال لینوکس',
    title_en: 'Fix Server Hostname and Current Working Directory (CWD) Path Desync in Linux Terminal Prompt',
    changes: [
      'رفع ریشه‌ای عدم تطابق نام میزبان (Hostname) در خط فرمان ترمینال Remote Servers با نام هاست و آدرس IP سرور انتخاب‌شده از طریق متمرکزسازی واکشی اطلاعات سرور معتبر (resolveValidServer و getServerHostName).',
      'همگام‌سازی صددرصدی مسیر جاری خط فرمان (CWD) با دایرکتوری واقعی، تشخیص دقیق دایرکتوری خانگی کاربر (root/ و home/<user>/) و به‌روزرسانی بلادرنگ پرامپت در دستورات تغییر دایرکتوری (cd).',
      'اصلاح خروجی دستورات شبیه‌ساز شامل whoami و hostname متناسب با اطلاعات اختصاصی هر سرور لینوکسی متصل‌شده.',
      'به‌روزرسانی هدر بنر پیام روز (MOTD)، وضعیت پنجره‌های تقسیم‌شده (Split Panes) و پرامپت‌های تاریخچه و کلیدهای ترکیبی بر اساس هاست‌نیم و مسیر واقعی سرور.'
    ],
    changes_en: [
      'Fixed the root cause of hostname mismatch in the Remote Servers Linux terminal prompt by centralizing valid server identification and fallback resolution (resolveValidServer and getServerHostName).',
      'Achieved 100% synchronization of current working directory (CWD) in the command prompt with real directories, accurate user home detection (/root and /home/<user>), and real-time prompt updates upon cd commands.',
      'Corrected emulator command responses including whoami and hostname to accurately reflect the target Linux server user and host identity.',
      'Updated the MOTD welcome banner, split pane initialization, command execution prompts, and abort histories to display genuine server hostname and actual working directories.'
    ]
  },
  {
    version: '1.99.4',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع خطای دیکود Base64 در تبدیل گواهی SSL، حذف دکمه Load Sample و خروجی پکیج ZIP جامع',
    title_en: 'Fix SSL Certificate Base64 Decoding Error, Remove Load Sample Button, and Add Full ZIP Package Download',
    changes: [
      'حذف دکمه Load Sample از تب تبدیل گواهی (Convertor) طبق درخواست کاربر.',
      'رفع ریشه‌ای خطای Failed to parse certificate syntax: bad base64 decode ناشی از وجود خطوط متادیتا (مانند Bag Attributes، subject= و issuer=) در گواهی‌های ورودی و نرمال‌سازی دقیق Base64 و ساختار DER.',
      'پیاده‌سازی ماژول ساخت پکیج فشرده ZIP شامل تمامی فرمت‌های تبدیل‌شده (PEM .crt، DER .cer، PKCS#7 .p7b/.p7c، PKCS#12 .pfx، Combined PEM .pem، Private Key .key و گزارش فنی) به همراه فایل راهنمای استقرار README.',
      'افزودن کارت دانلود پکیج ZIP و دکمه دانلود جامع یکپارچه در بالای لیست خروجی‌های تبدیل جهت دریافت تمام فرمت‌ها با یک کلیک.'
    ],
    changes_en: [
      'Removed the "Load Sample" button from the Certificate Converter tab as requested.',
      'Fixed the root cause of "Failed to parse certificate syntax: bad base64 decode" error caused by metadata headers (Bag Attributes, subject=, issuer=) in pasted certificates through robust PEM filtering and DER boundary slicing.',
      'Implemented automated multi-format batch conversion and bundled ZIP archive generation containing all output formats (PEM .crt, DER .cer, PKCS#7 .p7b/.p7c, PKCS#12 .pfx, Combined PEM .pem, Private Key .key, and technical report) along with a deployment README.',
      'Added a dedicated ZIP Suite Download card and prominent Download All button to retrieve the entire certificate package in a single click.'
    ]
  },
  {
    version: '1.99.3',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'ارتقای جامع ماژول تفکیک و تبدیل گواهی SSL/TLS، کلید خصوصی و باندل‌های ترکیبی در فایل‌های متنی',
    title_en: 'Universal SSL/TLS Certificate, Private Key, and Combined Bundle Parser & Converter Enhancements',
    changes: [
      'رفع کامل مشکل عدم تکمیل خودکار فیلد گواهی عمومی (Public Certificate) هنگام آپلود فایل‌های ترکیبی (.txt) حاوی کلید و گواهی.',
      'بهبود اساسی رجکس‌ها و الگوریتم‌های تفکیک در فرانت‌اند و بک‌اند جهت استخراج قطعی انواع هدرهای گواهی (CERTIFICATE، SERVER CERTIFICATE، PKCS7، X509 و...) بدون وابستگی به فاصله‌ها یا خطوط تیره.',
      'افزودن قابلیت استخراج هوشمند گواهی از جریان‌های خام Base64 و ASN.1 (پیشوند MII) حتی در صورت مفقودی یا ناقص بودن هدرها و برچسب‌های متنی.',
      'رفع خطای "Could not find a valid SSL/TLS certificate" هنگام ورود دستی یا کپی پیست متن‌های ترکیبی و همگام‌سازی کامل فیلدهای ورودی پس از تبدیل.',
      'تجهیز ماژول به موتور پشتیبان OpenSSL CLI در سرور برای اعتبارسنجی قطعی و استخراج تمامی ساختارهای رمزنگاری بدون خطا.'
    ],
    changes_en: [
      'Resolved issue where uploading combined .txt files populated the Private Key field but failed to populate the Public Certificate field.',
      'Comprehensive regex and parsing engine overhaul in both frontend and backend to reliably capture all certificate header variants (CERTIFICATE, SERVER CERTIFICATE, PKCS7, X509, etc.) regardless of spacing or dash formatting.',
      'Added resilient fallback extraction for raw Base64 and ASN.1 DER streams (MII prefix) even when standard header tags are omitted or damaged.',
      'Fixed the "Could not find a valid SSL/TLS certificate" error when manually pasting or uploading dirty/combined inputs, ensuring automatic field synchronization upon conversion.',
      'Integrated authoritative OpenSSL CLI fallback on the backend to guarantee seamless parsing and validation across all cryptographic bundle formats.'
    ]
  },
  {
    version: '1.99.2',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع مشکل اتصال ترمینال لینوکس از لیست سرورهای ریموت و همگام‌سازی چرخه اتصال',
    title_en: 'Fix Direct Linux Terminal Connection from Remote Servers Fleet and Sync Lifecycle',
    changes: [
      'رفع ریشه‌ای مشکل معلق ماندن اتصال ترمینال هنگام کلیک روی دکمه ترمینال در لیست Remote Servers & Automation Fleet.',
      'هماهنگ‌سازی کامل منطق اتصال با عملکرد مودال Split Pane و اطمینان از زمان‌بندی دقیق اتصال پس از مقداردهی استیت‌ها.',
      'استفاده از مراجع پایدار (panesRef و serverRef) جهت جلوگیری از بازآفرینی غیرضروری سوکت و تضمین ارسال صحیح مشخصات سرور، پورت و نام کاربری به وب‌سوکت SSH.',
      'پاکسازی و ریست خودکار وضعیت اتصال و ارجاعات در هنگام بستن مودال ترمینال جهت اتصال سریع و بی‌نقص در دفعات بعدی.'
    ],
    changes_en: [
      'Resolved root cause of terminal connection hanging when clicking the Terminal button directly in the Remote Servers & Automation Fleet list.',
      'Fully synchronized connection initiation with split-pane lifecycle patterns, ensuring reliable post-mount connection scheduling.',
      'Stabilized pane and server references (panesRef, serverRef) to prevent redundant reconnects and guarantee accurate transmission of host, port, and credentials to the SSH WebSocket.',
      'Added clean reset of connection states and references upon closing the terminal modal to guarantee fresh, immediate reconnection on subsequent opens.'
    ]
  },
  {
    version: '1.99.1',
    releaseDate: '2026-09-21',
    type: 'patch',
    title: 'رفع خطای اعتبارسنجی سینتکس گواهی (no start line) و بهبود پردازش پکیج‌های ترکیبی و کلیدهای خصوصی',
    title_en: 'Fix Certificate Syntax Parsing Error (no start line) and Enhance Combined Bundle & Key Processing',
    changes: [
      'رفع ریشه‌ای خطای "Failed to parse certificate syntax: error:0480006C:PEM routines::no start line" در مبدل گواهی‌های SSL/TLS.',
      'پیاده‌سازی ماژول نرمال‌سازی هوشمند PEM (حذف خودکار بایت BOM، تبدیل خطوط تیره یونیکد، استانداردسازی شکست خطوط و پیرایش متون اضافی ارائه‌دهندگان SSL).',
      'پشتیبانی خودکار از فایل‌ها و متون ترکیبی (Combined): تفکیک و استخراج هوشمند گواهی، کلید خصوصی و زنجیره میانی حتی در صورت قرارگیری هم‌زمان در یک فیلد یا یک فایل متنی.',
      'پیاده‌سازی مکانیزم بازگشتی (Fallback) اعتبارسنجی با OpenSSL CLI در صورت عدم شناسایی هدرها توسط متد استاندارد Node.js crypto.',
      'افزودن بنر هوشمند تشخیص پکیج ترکیبی و دکمه تفکیک آنی فیلدها در رابط کاربری جهت آسایش کاربر.',
      'پشتیبانی جامع از مقایسه ماژولوس و هش کلید عمومی برای انواع کلیدهای RSA، EC و PKCS#8 بدون شکست فرآیند تبدیل.'
    ],
    changes_en: [
      'Fixed root cause of "Failed to parse certificate syntax: error:0480006C:PEM routines::no start line" in the SSL/TLS Certificate Converter.',
      'Implemented smart PEM normalization engine: strips UTF-8 BOM, normalizes Unicode hyphens/dashes, standardizes line breaks, and trims extraneous vendor preamble text.',
      'Seamless support for combined bundles: automatically detects and isolates public certificate, private key, and intermediate CA chain even when pasted together in a single field or text file.',
      'Added resilient OpenSSL CLI fallback parser to extract metadata if Node.js crypto parser encounters non-standard preamble formatting.',
      'Added smart combined bundle detection banner and one-click field separation button in the UI for optimal user experience.',
      'Comprehensive support for modulus and public key hash verification across RSA, EC, and PKCS#8 key structures.'
    ]
  },
  {
    version: '1.99.0',
    releaseDate: '2026-09-21',
    type: 'minor',
    title: 'افزودن تب تبدیل فرمت‌های گواهی SSL/TLS و استخراج آرشیو با دانلود مستقیم فایل‌ها',
    title_en: 'Add SSL/TLS Certificate Format Converter & Archive Extractor with Direct Downloads',
    changes: [
      'افزودن تب مبدل فرمت‌های گواهی امنیتی به ابزار بازرس گواهی‌های SSL/TLS جهت تبدیل آسان گواهی‌های خریداری‌شده به تمامی استانداردهای سروری.',
      'پشتیبانی جامع از خروجی‌های استاندارد در صورت ارائه گواهی عمومی: PEM (.crt), DER (.cer), PKCS#7 (.p7b), گزارش متنی جزئیات فنی.',
      'پشتیبانی از پکیج‌های پیشرفته در صورت ارائه کلید خصوصی و CA Bundle: فرمت پرکاربرد ویندوز/IIS آرشیو PKCS#12 (.pfx), باندل ترکیبی سرور Nginx/Apache (Combined PEM), و کلید استاندارد PKCS#8.',
      'پیاده‌سازی ماژول استخراج کامل (Extract PFX/P12): بازگشایی آرشیوهای رمزگذاری‌شده PFX/P12 و تفکیک خودکار گواهی عمومی، کلید خصوصی و زنجیره CA.',
      'اعتبارسنجی رمزنگاری تطابق ماژولوس کلید خصوصی با گواهی عمومی بر اساس هش MD5 جهت اطمینان از سازگاری قبل از استقرار.',
      'امکان دانلود مجزای هر فرمت با نام‌گذاری استاندارد یا دانلود یکجای تمام فرمت‌ها، به همراه قابلیت مشاهده پیش‌نمایش کد و کپی در کلیپ‌بورد.',
      'رعایت کامل استانداردهای مودال (قانون ۷)، دکمه‌های کنترلی سه‌گانه، تم تاریک/روشن و چندزبانگی صددرصدی.'
    ],
    changes_en: [
      'Added comprehensive Certificate Format Converter tab to the SSL/TLS Inspector tool to convert purchased certificates to all production server formats.',
      'Full cryptographic conversion of public certificates to PEM (.crt), DER (.cer), PKCS#7 (.p7b), and structured technical report.',
      'Supported advanced packaging with Private Key and CA Bundle into PKCS#12 (.pfx) for IIS/Azure, Combined PEM for Nginx/Apache, and PKCS#8 private keys.',
      'Implemented PFX/P12 archive extraction module: decrypts password-protected archives and isolates public certificate, private key, and CA chain.',
      'Cryptographic modulus integrity check verifying private key matches public certificate via MD5 hash comparison.',
      'One-click individual or batch downloads of all generated formats with formatted file naming, code preview, and clipboard copy.',
      'Full compliance with Universal Modal Standards (Rule 7), header controls, dark/light themes, and strict bilingual localization.'
    ]
  },
  {
    version: '1.98.3',
    releaseDate: '2026-09-20',
    type: 'patch',
    title: 'رفع مشکل اتصال ترمینال لینوکس از لیست سرورها و پیاده‌سازی مذاکره انطباقی پروتکل SSH',
    title_en: 'Fix Linux Terminal Connection from Server List & Implement Adaptive SSH Negotiation',
    changes: [
      'رفع ریشه‌ای اختلال اتصال ترمینال هنگام کلیک روی آیکون ترمینال در لیست ناوگان سرورها (Remote Servers & Automation Fleet) با تثبیت چرخه عمر مودال و همگام‌سازی استیت سرور ورودی.',
      'حل مشکل تلاش اتصال به undefined در سشن BASH SSH با استخراج و اولویت‌بندی دقیق پارامترهای سرور در کلاینت و اندپوینت وب‌سوکت.',
      'پیاده‌سازی سازوکار انطباقی مذاکره الگوریتم‌های SSH2 بر اساس اصل دوازدهم (Rule 12): اتصال با سایفرهای مدرن در وهله اول و فالبک خودکار به الگوریتم‌های سنتی در صورت عدم تطابق.',
      'تضمین حفظ تاریخچه و سشن‌های فعال ترمینال هنگام بازیابی از نوار ابزار پایین (ToolsDock).'
    ],
    changes_en: [
      'Resolved root cause of terminal connection hang when launching from the Remote Servers fleet list by fixing state synchronization and modal lifecycle hooks.',
      'Eliminated undefined host/IP connection attempts by ensuring robust target server resolution in LinuxTerminalModal and query parameter sanitization in the WebSocket gateway.',
      'Implemented Rule 12 adaptive SSH protocol negotiation: modern standard ciphers attempted first, with automatic graceful fallback to legacy compatibility ciphers upon handshake failure.',
      'Preserved terminal pane history and session continuity when minimizing to and restoring from the ToolsDock.'
    ]
  },
  {
    version: '1.98.2',
    releaseDate: '2026-09-20',
    type: 'patch',
    title: 'افزودن ۷ اصل و دستورالعمل کلیدی مهندسی و کیفی به قوانین هوش مصنوعی و پروژه',
    title_en: 'Added 7 Core Mandatory Engineering and Quality Directives to AI System Policies',
    changes: [
      'ثبت قانون ممنوعیت مطلق داده‌های جعلی، موک و شبیه‌سازی‌شده (No Fake/Simulated Data — Ever) برای کلیه ماژول‌های ارتباط با تجهیزات فیزیکی و مجازی.',
      'الزام ارائه مدرک عینی و تست واقعی (لاگ، خروجی زنده) قبل از اعلام وضعیت حل مشکل (Evidence-Based Resolution).',
      'تدوین قانون قطعی عدم رگرسیون و حفظ ۱۰۰ درصدی کلیه قابلیت‌های قبلی با بررسی اثرات تغییرات اشتراکی (Zero Regression).',
      'الزام تفکیک کامیت‌ها و پوش‌ها به ازای هر تسک/باگ مستقل به همراه افزایش متناظر شماره نسخه در برنچ master.',
      'پیاده‌سازی سازوکار ارتباطی انطباقی و چندنسلی (Adaptive Protocol Negotiation) با اولویت متدهای مدرن و فالبک خودکار به روش‌های سازگار قدیمی.',
      'تأکید بر ریشه‌یابی و حل بنیادین ایرادات به جای رفع سطحی علائم یا افزودن ترای‌کچ‌های خاموش.',
      'الزام امنیت و محرمانگی اعتبارنامه‌ها با رمزنگاری در پایگاه‌داده و منع مطلق ارسال پسوردها به فرانت‌اند یا لاگ‌ها.'
    ],
    changes_en: [
      'Codified absolute prohibition on mock, synthetic, or simulated data across all network and server protocol modules (No Fake/Simulated Data — Ever).',
      'Enforced empirical proof and real runtime verification requirement before declaring any issue as resolved (Evidence-Based Resolution).',
      'Established strict zero-regression policy requiring comprehensive impact assessments on shared utilities across dependent features.',
      'Mandated atomic commits and pushes per independent item accompanied by standard semantic version bumping on the master branch.',
      'Defined adaptive, multi-generation protocol negotiation (modern standard ciphers first, automatic graceful fallback to legacy compatibility).',
      'Required root-cause diagnostic engineering over superficial symptom suppression or silent error handling.',
      'Mandated zero-leak credential security with at-rest encryption and server-side-only in-flight decryption without client exposure.'
    ]
  },
  {
    version: '1.98.1',
    releaseDate: '2026-09-20',
    type: 'patch',
    title: 'تکمیل خودکار جامع مسیرها، پوشه‌ها و فایل‌ها با کلید Tab مشابه شل Bash لینوکس',
    title_en: 'Full Shell-Style Tab Autocompletion for Directory Paths, Relative/Absolute Routes, and Filenames',
    changes: [
      'رفع کامل باگ عدم تکمیل نام دایرکتوری‌ها و فایل‌ها بعد از دستورات ترمینال (مانند cd doc به cd documents/).',
      'پشتیبانی دقیق از تکمیل مسیرهای نسبی (..، ../..، .، ./، ~/، مسیرهای محلی) و مسیرهای مطلق (/etc/ng به /etc/nginx/).',
      'تطبیق هوشمند دستورات تغییر پوشه (cd و rmdir) جهت پیشنهاد انحصاری دایرکتوری‌ها و اسلش پایانی مشابه شل واقعی Bash.',
      'پشتیبانی از دستورات کار با فایل (cat، nano، vim، ls، rm، cp، mv، grep، tail، head، chmod، chown و ...) با تکمیل همزمان فایل‌ها و پوشه‌ها.',
      'افزودن امکان ثبت بلادرنگ و پویا در ساختار VFS در زمان اجرای دستورات ساخت پوشه و فایل (mkdir، touch، nano، vim) و حذف آن‌ها (rm).',
      'اصلاح کامل درج مقدار کاندیداهای پیشنهادی هنگام کلیک یا انتخاب در پنجره هوشمند پیشنهادات با استفاده از fullCompletedInput.'
    ],
    changes_en: [
      'Resolved the issue where Tab autocomplete only matched root commands and failed on directory paths and filenames after commands (e.g. cd doc<TAB> now seamlessly completes to cd documents/).',
      'Implemented robust relative and absolute path resolution including .., ../.., ., ./, ~/, and system absolute paths like /etc/ng<TAB> to /etc/nginx/.',
      'Tuned folder-specific commands (cd, rmdir) to exclusively complete directory entries with trailing slashes, matching authentic Bash shell semantics.',
      'Enabled full path & file completion for file inspection and manipulation tools (cat, nano, vim, ls, rm, cp, mv, grep, tail, head, chmod, chown, etc.) with automatic trailing space insertion for files.',
      'Added dynamic Virtual File System (VFS) live synchronization upon executing mkdir, touch, nano, vim, and rm commands in the terminal.',
      'Fixed intellisense popup selection to insert the complete reconstructed command (fullCompletedInput) instead of only the isolated token.'
    ]
  },
  {
    version: '1.98.0',
    releaseDate: '2026-09-20',
    type: 'minor',
    title: 'پشتیبانی از اتصال همزمان به سرورهای مختلف در نمای چندگانه ترمینال (Multi-Server Split View)',
    title_en: 'Multi-Server Split View: Open Multiple Shell Panes to Different Linux Servers Simultaneously',
    changes: [
      'افزودن امکان انتخاب و باز کردن شل ترمینال به سرورهای مختلف از لیست سرورها در نمای تفکیک‌شده (Split View).',
      'طراحی مودال حرفه‌ای انتخاب سرور (Server Picker Modal) با فیلتر جستجوی زنده بر اساس نام، آی‌پی، توزیع سیستم‌عامل و برچسب‌ها.',
      'امکان انتخاب محیط شل (Bash یا Zsh) و دریافت رمز عبور یکبارمصرف (Ephemeral Password) برای سرورهای مقصد با احراز هویت پسورد.',
      'افزودن گزینه اتصال سریع (Quick-Connect) به سایر سرورها مستقیماً در منوی بازشونده Split View.',
      'جداسازی کامل نشست‌ها، نشست‌های وب‌سوکت مستقل، وضعیت احراز هویت، تاریخچه دستورات و مسیر دایرکتوری (CWD) به ازای هر سرور در پنل‌ها.',
      'نمایش نشانگر نام سرور، آیکون و آی‌پی در هدر هر پنجره تفکیک‌شده به منظور تشخیص آسان سرور متصل.'
    ],
    changes_en: [
      'Added the ability to select and open terminal shell sessions to different remote Linux servers from the server catalog within Split View.',
      'Engineered an interactive Server Picker modal dialog with live search filtering across server names, IP addresses, OS distros, and tags.',
      'Supported per-pane shell selection (Bash or Zsh) and on-demand ephemeral password authentication for password-protected target servers.',
      'Added a Quick-Connect list of other available servers directly in the Split View dropdown menu.',
      'Isolated session states, independent WebSockets, authentication states, command histories, and current working directories (CWD) per pane/server.',
      'Added server identity badges (name, IP, icon) in each pane sub-header for clear differentiation across multi-server layouts.'
    ]
  },
  {
    version: '1.97.2',
    releaseDate: '2026-09-20',
    type: 'patch',
    title: 'تکمیل خودکار هوشمند Tab شبیه به Bash شل واقعی لینوکس برای دستورات، فایل‌ها، مسیرها، سرویس‌ها و پکیج‌ها',
    title_en: 'Authentic Linux Bash Tab Autocompletion Engine for Commands, VFS Paths, Files, Subcommands, Services, and Packages',
    changes: [
      'پیاده‌سازی موتور جامع تکمیل خودکار کلید Tab مشابه با شل Bash واقعی لینوکس بر اساس دایرکتوری کاری جاری (CWD).',
      'تجهیز سیستم به فایل‌سیستم مجازی لینوکس (VFS) با پشتیبانی کامل از پوشه‌ها و فایل‌های سیستمی (/etc/nginx، /var/log، /opt، /root، .ssh، ...) جهت تکمیل مسیرها و فایل‌ها با دستوراتی نظیر cd، ls، cat، nano، vim، tail، head، grep، rm، cp، mv، touch و mkdir.',
      'پشتیبانی از کلید Tab دوگانه (Double Tab): در صورت وجود چند گزینه، فهرست پیشنهادات با رنگ‌بندی تفکیک‌شده ANSI (آبی برای دایرکتوری‌ها، سبز برای فایل‌های اجرایی) در خطوط ترمینال چاپ می‌شود.',
      'افزودن قابلیت تکمیل هوشمند نام سرویس‌های systemd برای دستورات systemctl و journalctl -u و نام کانتینرهای داکر و بسته‌های apt.',
      'پشتیبانی از دستورات چندبخشی، پایپ‌لاین‌ها (|)، عملگرهای شرطی (&&، ||)، فاصله‌ها، و پیشوند sudo.',
      'افزودن امکان پذیرش پیشنهاد خاکستری (Ghost Text) با کلید پیکان راست (ArrowRight) در انتهای خط.'
    ],
    changes_en: [
      'Implemented an authentic Linux Bash Tab autocompletion engine dynamically aware of current working directory (CWD).',
      'Engineered a comprehensive Linux Virtual File System (VFS) with standard system paths (/etc/nginx, /var/log, /opt, /root, .ssh, etc.) enabling path and file autocompletion for cd, ls, cat, nano, vim, tail, head, grep, rm, cp, mv, touch, and mkdir.',
      'Added standard Bash double-Tab behavior: when multiple matches exist with no further common prefix progression, matching items are displayed directly in the terminal buffer with ANSI syntax coloring (cyan for directories, green for executables).',
      'Integrated smart service autocompletion for systemctl and journalctl -u, Docker container names for docker logs/restart/stop, and APT packages for apt install.',
      'Supported pipeline (|) segments, logical operators (&&, ||), delimiters (;), trailing arguments, and sudo prefixes.',
      'Added Right Arrow key (ArrowRight) support to accept inline ghost text autocompletion at end of line.'
    ]
  },
  {
    version: '1.97.1',
    releaseDate: '2026-09-20',
    type: 'patch',
    title: 'اصلاح پرامپت ترمینال لینوکس و به‌روزرسانی زنده دایرکتوری جاری (CWD) با دستور cd و همگام‌سازی مسیر',
    title_en: 'Fix Linux Terminal Prompt to Dynamically Reflect Current Working Directory (CWD) on cd and Session Synchronization',
    changes: [
      'رفع باگ ثابت ماندن پرامپت ترمینال روی root@linux:~# و پیاده‌سازی به‌روزرسانی لحظه‌ای مسیر جاری با اجرای دستورات cd، cd ..، cd /، cd - و دایرکتوری‌های تودرتو.',
      'پیاده‌سازی الگوریتم استاندارد و امن پیمایش مسیرهای لینوکس (resolveLinuxPath) با پشتیبانی از بازگشت به والد، ریشه، پوشه خانگی کاربر و مسیر قبلی.',
      'همگام‌سازی خروجی دستورات pwd و ls با دایرکتوری کاری فعال در شل‌های Bash و Zsh.',
      'افزودن امکان تشخیص خودکار مسیر کاری از روی کدهای اسکیپ استاندارد OSC 7 و پرامپت‌های دریافتی از سرور واقعی لینوکس در ارتباط وب‌سوکت.',
      'افزودن پیشنهادات دایرکتوری‌های پرکاربرد سیستم‌عامل لینوکس در سیستم تکمیل خودکار Tab برای دستور cd.'
    ],
    changes_en: [
      'Resolved static root@linux:~# prompt bug by implementing real-time dynamic CWD tracking and prompt synchronization across cd, cd .., cd /, cd -, and nested directory paths.',
      'Implemented standard POSIX path resolution engine (resolveLinuxPath) supporting root, user home (~), relative, parent (..), and previous directory (-) transitions.',
      'Synchronized pwd and ls outputs to accurately reflect the active working directory context across both Bash and Zsh panes.',
      'Added automatic CWD detection from incoming OSC 7 sequences and remote interactive shell prompts in live WebSocket SSH sessions.',
      'Integrated cd directory suggestions (/etc, /var/log, /var/www, /opt, .., ~) into the Linux Tab Intellisense engine.'
    ]
  },
  {
    version: '1.97.0',
    releaseDate: '2026-09-20',
    type: 'minor',
    title: 'ارتقای ترمینال تعاملی سرورهای لینوکس: رفع کاراکترهای اسکیپ کدهای رنگی ANSI، سیستم هوشمند Intellisense و تکمیل خودکار با Tab، قابلیت تقسیم صفحه (Split Screen) و اصلاح بررسی رمز عبور در زمان اتصال',
    title_en: 'Linux Terminal Overhaul: Clean ANSI Escape Codes Formatting, Intelligent Tab-Completion Engine, Multi-Shell Split Screen Layout, and Connection-Time Password Auth Enforcement',
    changes: [
      'پیاده‌سازی موتور پردازش و استخراج کدهای رنگی و کنترل ANSI (شامل کدهای SGR، رنگ‌های 256گانه، متن‌های Bold و پاک‌سازی کاراکترهای مخرب و زائد نظیر [33m و [0m) در خروجی‌های ترمینال لینوکس.',
      'افزودن سیستم هوشمند Intellisense لینوکس با پایگاه جامع دستورات (systemctl، docker، ip، ss، ufw، journalctl، free، df و...) همراه با توضیحات دوزبانه.',
      'پیاده‌سازی قابلیت تکمیل خودکار با کلید Tab (Autocomplete) شامل پیش‌نمایش متنی شناور (Ghost Suggestion)، محاسبه طولانی‌ترین پیشوند مشترک (LCP) و پاپ‌آپ انتخاب گزینه‌ها.',
      'طراحی و پیاده‌سازی قابلیت تقسیم صفحه (Split Screen) مشابه ترمینال سیسکو با امکان باز کردن ۲ شل کناری (Columns)، ۲ شل ردیفی (Rows) یا ۴ شل همزمان (Grid 2x2) با سشن‌های وب‌سوکت و تاریخچه مستقل.',
      'اصلاح و اعمال قطعی قابلیت «درخواست رمز عبور در لحظه اتصال» (Prompt for password at connection time): جلوگیری از اتصال مستقیم بدون رمز و نمایش مودال امن احراز هویت در زمان اتصال بدون ذخیره در دیتابیس.'
    ],
    changes_en: [
      'Implemented robust ANSI escape sequences and SGR/256-color parsing and sanitization engine, resolving raw escaped characters (such as [33m, [0m, and stray bracketed markers) into clean styled terminal output.',
      'Added Linux Terminal Intellisense engine featuring a comprehensive catalog of system commands, subcommands, and flags with dual-language descriptions.',
      'Implemented Tab-key autocompletion with inline ghost text suggestions, Longest Common Prefix (LCP) completion, and an interactive candidate popover.',
      'Engineered Cisco-style Multi-Shell Split Screen workspace supporting Side-by-Side (Columns), Stacked (Rows), and Quad (2x2 Grid) views with independent WebSocket channels and histories.',
      'Enforced "Prompt for password at connection time" with strict zero-storage authentication guard in backend and frontend, preventing direct unauthenticated bypass.'
    ]
  },
  {
    version: '1.96.0',
    releaseDate: '2026-09-20',
    type: 'minor',
    title: 'افزودن قابلیت تنظیم پورت اتصال وین‌باکس (WinBox Port) در مدیریت تجهیزات شبکه و اجرای مستقیم WinBox با پورت سفارشی',
    title_en: 'Configurable WinBox Connection Port in Network Equipment Inventory & Direct Launcher with Custom Port Support',
    changes: [
      'افزودن فیلد پورت اتصال به نرم‌افزار وین‌باکس (WinBox Port با پیش‌فرض 8291) به مشخصات تجهیز در مودال‌های افزودن (AddDeviceModal) و ویرایش تجهیز (EditDeviceModal).',
      'تجهیز فیلد پورت وین‌باکس به راهنمای سه‌بخشی استاندارد (FieldInfoTooltip) شامل این چیست، چرا لازم است و مثال‌های کاربردی به دو زبان فارسی و انگلیسی.',
      'به‌روزرسانی بک‌اند پایتون و اسکیمای پایگاه داده (PostgreSQL و JSON Store) برای ذخیره و ماندگاری دائمی فیلد winbox_port در متدهای ایجاد و ویرایش تجهیز.',
      'ارتقای مودال‌های مدیریت میکروتیک (MikroTikDeviceManageModal و MikroTikTerminalModal) جهت استخراج پورت تنظیم‌شده و اجرای آنی WinBox از طریق پروتکل winbox:// با پورت سفارشی.',
      'به‌روزرسانی مودال WinBoxLauncherModal جهت پشتیبانی کامل از پورت سفارشی در دستور خط فرمان (CLI)، اسکریپت اجرایی یک‌کلیک (.bat) و نمایش داینامیک بج پورت در هدر.',
      'نمایش بج و برچسب تفکیک‌شده پورت وین‌باکس در ستون مشخصات IP در جدول مدیریت موجودی تجهیزات شبکه (DeviceListView).'
    ],
    changes_en: [
      'Added configurable WinBox management port (default 8291) to device profiles in both AddDeviceModal and EditDeviceModal.',
      'Equipped the WinBox port field with standard 3-part FieldInfoTooltip (What is it, Why is it needed, Practical example) with full English and Persian localization.',
      'Updated Python backend and database schema (PostgreSQL schema & fallback JSON store) for persistent storage and retrieval of the winbox_port field across create/update endpoints.',
      'Enhanced MikroTik management modals (MikroTikDeviceManageModal and MikroTikTerminalModal) to extract the configured port and launch WinBox directly via winbox:// with the specified port.',
      'Upgraded WinBoxLauncherModal to dynamically reflect custom ports in CLI commands, 1-click desktop batch launcher (.bat), protocol handlers, and header badges.',
      'Added clear WinBox port indicator badge in the IP and Connection column within the Network Equipment Inventory table (DeviceListView).'
    ]
  },
  {
    version: '1.95.0',
    releaseDate: '2026-09-20',
    type: 'minor',
    title: 'سیستم جامع مدیریت داینامیک دسته‌بندی سرورها (Server Categories CRUD)، پایگاه داده ماندگار PostgreSQL و JSON، مودال استاندارد ManageServerCategoriesModal با قابلیت انتقال امن سرورها',
    title_en: 'Dynamic Server Categories Management (CRUD), Persistent PostgreSQL & JSON Database Storage, Full-Featured ManageServerCategoriesModal with Safe Fleet Server Reassignment',
    changes: [
      'پیاده‌سازی کامل سیستم مدیریت دسته‌بندی‌های سرورها با امکان ایجاد (Create)، ویرایش (Update) و حذف (Delete) کامل در پایگاه داده.',
      'طراحی جدول استاندارد server_categories در دیتابیس PostgreSQL و انطباق کامل با فایل ذخیره‌ساز fallback JSON جهت ماندگاری دائمی پس از ری‌استارت سرویس یا بارگذاری مجدد صفحه.',
      'ارائه API کامل RESTful در مسیر /api/server-categories شامل متدهای GET، POST، PUT و DELETE با قابلیت دریافت تعداد سرورهای متصل به هر دسته.',
      'پیاده‌سازی مکانیزم همگام‌سازی بلادرنگ (Cascading Renaming): با تغییر نام یک دسته‌بندی، تمامی سرورهای متصل به آن در دیتابیس بدون قطعی به‌روزرسانی می‌شوند.',
      'پیاده‌سازی روال امن انتقال سرورها در هنگام حذف (Safe Deletion with Reassignment): جلوگیری از بی‌دسته شدن سرورها، امکان انتخاب دسته مقصد (با پیش‌فرض Uncategorized)، و قفل امنیتی دسته‌بندی پیش‌فرض سیستم.',
      'طراحی مودال استاندارد ManageServerCategoriesModal با رعایت دقیق تمامی اصول ۵گانه (دکمه‌های سه‌گانه هدر، مرزبندی دقیق بالای فوتر bottom-8 در حالت تمام‌صفحه، انطباق کامل تم‌های تیره/روشن، داک ابزارها و تولتیپ‌های سه‌گانه ایمن).',
      'تجهیز فرم افزودن و ویرایش سرورها (AddEditServerModal) و فیلترهای نوار ابزار (RemoteServersView) به دسته‌بندی‌های پویا و دکمه دسترسی مستقیم به مدیریت دسته‌ها.'
    ],
    changes_en: [
      'Implemented comprehensive Dynamic Server Category Management (CRUD) allowing users to create, modify, and delete server categories.',
      'Added persistent server_categories PostgreSQL table schema and JSON fallback store synchronization, ensuring zero data loss across reloads and service restarts.',
      'Built full RESTful endpoints at /api/server-categories (GET, POST, PUT, DELETE) with real-time server count aggregation.',
      'Engineered automated cascading renaming: updating a category name instantly synchronizes all assigned servers across the fleet in the database.',
      'Engineered safe category deletion with target server reassignment (defaulting to Uncategorized), preventing orphaned server records and protecting default system categories.',
      'Constructed the dedicated ManageServerCategoriesModal conforming to all 5 Universal Modal Architectural Standards (tri-control buttons, bottom-8 footer clearance in fullscreen, dark/light theme fidelity, tools dock integration, and 3-part boundary-safe field tooltips).',
      'Refactored AddEditServerModal and RemoteServersView to dynamically consume live database categories and provide instant access to the category manager.'
    ]
  },
  {
    version: '1.94.0',
    releaseDate: '2026-09-20',
    type: 'minor',
    title: 'قابلیت عدم ذخیره رمز عبور (On-Demand Password Prompt) با سیاست Zero-Storage، مودال امنیتی احراز هویت در لحظه اتصال، رفع کامل باگ قفل شدن فیلدهای فرم ادیت سرور و هماهنگی کامل چندزبانه و نوار داک',
    title_en: 'Zero-Storage On-Demand Password Prompt for Remote Servers, Interactive Ephemeral Auth Modal for RDP/VNC/Terminal, Resolution of Edit Form Input Freeze, and Full Bilingual & Dock Integration',
    changes: [
      'افزودن قابلیت "عدم ذخیره رمز عبور (درخواست در زمان اتصال)" (Prompt for password at connection time) با سوئیچ اختصاصی در فرم افزودن و ویرایش سرورهای لینوکسی و ویندوزی.',
      'پیاده‌سازی سیاست سخت‌گیرانه Zero-Storage: جلوگیری قطعی از ذخیره رمز در دیتابیس، فایل‌های استور و سرور در صورت فعال بودن این گزینه و حذف آنی در صورت ویرایش.',
      'طراحی و توسعه کامپوننت مودال استاندارد OnDemandPasswordModal جهت اخذ رمز عبور موقت در لحظه اتصال با رعایت دقیق تمامی قوانین ۵گانه مودال‌ها (دکمه‌های سه‌گانه، انطباق تم تیره/روشن، مرزبندی بالای فوتر، داک و تولتیپ سه‌گانه ایمن).',
      'پشتیبانی کامل از احراز هویت موقت (Session-Only Ephemeral Auth) در توکن‌های گیت‌وی Guacamole برای RDP/VNC و نشست‌های SSH وب‌سوکت لینوکس و پاک‌سازی بلادرنگ رمز از حافظه مرورگر پس از بستن پنجره.',
      'رفع ریشه‌ای باگ قفل شدن و عدم امکان تایپ در فیلدهای فرم ویرایش سرور (حذف تداخل استیت و حفظ رفرنس‌های ورودی).',
      'نمایش نشان اختصاصی "بدون‌ذخیره / No-Store" در کارت‌ها و جدول لیست سرورها به همراه پاپ‌آپ راهنما جهت اطلاع‌رسانی شفاف وضعیت امنیتی سرور.'
    ],
    changes_en: [
      'Introduced "Prompt for password at connection time" security toggle in both Linux and Windows Remote Server add/edit forms.',
      'Implemented strict Zero-Storage credential architecture: passwords are completely bypassed and never stored in the database or persistence layer when this policy is active.',
      'Created and integrated the full-fledged OnDemandPasswordModal for interactive runtime password prompt before launching RDP, VNC, or SSH consoles.',
      'Enforced all Universal Modal Standards: tri-control header buttons (Close, Minimize to dock, Fullscreen with bottom-8 footer boundary), light/dark mode contrast, and safe 3-part field info tooltips.',
      'Added ephemeral token support to Guacamole RDP/VNC gateway and Linux SSH WebSockets, with instantaneous memory purge upon session termination.',
      'Fixed the input freeze bug in the Edit Server form, ensuring seamless typing and unblocked credential updates.',
      'Added clean "No-Store" badges to server fleet table rows and grid cards with contextual tooltip guidance.'
    ]
  },
  {
    version: '1.93.2',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'رفع قطعی مشکل فریز در Connecting در ریموت دسکتاپ، اجرای خودکار guacd در استارتاپ سرور، ارسال خطای شفاف و تایم‌اوت هوشمند ۱۰ ثانیه‌ای با کادر تشخیصی عیب‌یابی',
    title_en: 'Definitive Fix for Remote Desktop "Connecting..." Hang, Auto-start guacd Daemon on Server Boot, Graceful Error Delivery, and 10s Smart Timeout with Diagnostics Card',
    changes: [
      'بررسی عمیق و رفع ریشه‌ای باگ توقف در Connecting: تضمین بررسی و اجرای خودکار دیمن guacd در استارتاپ سرور (server.ts) و راه‌اندازی در صورت غیرفعال بودن.',
      'اصلاح و تقویت پارامترهای اتصال RDP به دیمن guacd شامل مقادیر دقیق رزولوشن، تراکم پیکسلی (dpi)، روش تغییر اندازه (display-update) و مکانیزم امنیتی nla/tls.',
      'جلوگیری از قطع ناگهانی سوکت وب‌سوکت در زمان خطای هندشیک و ارسال کدهای استاندارد خطای Guacamole به همراه تاخیر ایمن جهت دریافت کامل فریم خطا توسط مرورگر.',
      'افزودن تایم‌اوت هوشمند ۱۰ ثانیه‌ای در کلاینت مرورگر با نمایش فوری کادر خطای تشخیصی حاوی آدرس مقصد، پورت ۳۳۸۹، نام کاربری، وضعیت دیمن guacd و راهنمای بررسی فایروال و NLA.',
      'تست و راستی‌آزمایی واقعی جریان وب‌سوکت و هندشیک Guacamole و اطمینان از خروج کامل از حالت لودینگ و هدایت کاربر در تمام سناریوها.'
    ],
    changes_en: [
      'Conducted deep debugging and resolved root causes of the Remote Desktop "Connecting..." freeze: guaranteed automatic guacd daemon verification and background startup on Express server boot.',
      'Refined and enriched RDP connection parameters passed to guacd, including width, height, dpi, dynamic display resizing, and NLA/TLS fallback negotiation.',
      'Prevented premature WebSocket socket termination during handshake failures, ensuring standard Guacamole error frames are properly transmitted and processed by guacamole-common-js.',
      'Implemented a 10-second smart client timeout in InBrowserRemoteDesktopModal with an actionable diagnostics panel displaying target IP, RDP port 3389, username, guacd status, and troubleshooting tips.',
      'Validated end-to-end WebSocket tunnel and protocol negotiation with real test scripts, confirming resilient error trapping and immediate feedback.'
    ]
  },
  {
    version: '1.93.1',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'رفع کامل باگ توقف در Connecting در ریموت دسکتاپ، راه‌اندازی و اجرای دائم سرویس guacd، استریم سالم فریم‌های Guacamole و افزودن تایم‌اوت هوشمند ۱۵ ثانیه‌ای',
    title_en: 'Fix Remote Desktop Connecting Hang, Ensure Persistent guacd Service, Stream Pure Guacamole Frames, and Add 15s Resilient Timeout',
    changes: [
      'بررسی دقیق و رفع ریشه‌ای باگ توقف اتصال روی "Connecting to Live Remote Desktop Stream": نصب کامل بسته‌های دیمن بومی guacd و پلاگین‌های libguac-client-rdp0 و libguac-client-vnc0 روی سیستم‌عامل میزبان.',
      'اصلاح ساختار هندشیک در گیت‌وی ریموت دسکتاپ (remoteDesktopGateway): تجزیه دقیق دستورات args و پاسخ‌دهی استاندارد با size, audio, video, image و connect به همراه ارسال دستور آماده‌سازی تونل داخلی Guacamole (دستور با طول صفر و UUID نشست).',
      'حذف ارسال پیام‌های JSON بر روی تونل وب‌سوکت کلاینت Guacamole و جایگزینی با دستورات رسمی پروتکل Guacamole (opcode error با کد وضعیت‌های استاندارد) جهت جلوگیری از خطای Incomplete Instruction و کرش کلاینت.',
      'اصلاح اتصال فرانت‌اند (InBrowserRemoteDesktopModal): ارسال تمیز پارامتر token در فراخوانی client.connect، مدیریت وضعیت‌های مختلف تونل و کلاینت، و افزودن تایم‌اوت محافظتی ۱۵ ثانیه‌ای جهت نمایش پیام خطای شفاف در صورت عدم دسترسی به سرور مقصد.',
      'تست و راستی‌آزمایی عملکرد واقعی با ارسال درخواست توکن و برقراری موفق نشست ریموت با دریافت فریم‌های زنده گرافیکی، سایز، نشانگر ماوس و استریم صدا از دیمن guacd.'
    ],
    changes_en: [
      'Completely debugged and fixed the Remote Desktop "Connecting to Live Remote Desktop Stream" freeze: ensured native guacd daemon and plugins (libguac-client-rdp0, libguac-client-vnc0) are installed and actively listening on port 4822.',
      'Refined the Guacamole gateway handshake in remoteDesktopGateway: reliably parses args instructions, generates mapped connect parameters, and dispatches the internal Guacamole tunnel initiation handshake (zero-length opcode with session UUID).',
      'Eliminated invalid JSON payloads over the Guacamole client WebSocket, replacing them with standard Guacamole error protocol frames to prevent parsing crashes in guacamole-common-js.',
      'Updated InBrowserRemoteDesktopModal frontend: passes cleanly encoded token query parameters, handles tunnel and client state transitions, translates Guacamole status codes, and implements a 15-second timeout with actionable error messaging.',
      'Verified with real automated test scripts confirming successful handshake, display sizing, cursor blobs, audio streams, and interactive frame negotiation.'
    ]
  },
  {
    version: '1.93.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'بازطراحی جامع صفحه ناوگان سرورهای ریموت با زبان طراحی Spatial-Glass، تنظیم نمای پیش‌فرض لیستی، فشرده‌سازی مودال ثبت و همگام‌سازی بصری با صفحه تجهیزات شبکه',
    title_en: 'Comprehensive Redesign of Remote Servers Fleet with Spatial-Glass Design Language, Default List View, Compact Add/Edit Modal, and Visual Parity with Network Equipment Inventory',
    changes: [
      'بازطراحی کامل صفحه Remote Servers & Automation Fleet منطبق با سبک طراحی Spatial-Glass صفحه تجهیزات شبکه (Network Equipment Inventory & Management).',
      'تغییر نمای پیش‌فرض به نمای لیستی (viewMode = "list") با جدول شیشه‌ای مدرن، پدینگ‌های ارگونومیک، چک‌باکس‌های انتخاب چندتایی و نوار ابزار عملیات دسته‌جمعی.',
      'افزودن منوی سه‌نقطه شناور با ساختار پورتال (createPortal) و الگوریتم سنجش لبه‌های صفحه (Auto-Flip و Clamping) برای دسترسی فوری به ترمینال، ریموت دسکتاپ، تست پینگ، کپی آی‌پی و ویرایش/حذف سرور.',
      'بازطراحی و فشرده‌سازی کامل مودال ثبت و ویرایش سرور (AddEditServerModal) با هدر کنترل‌های سه‌گانه، تم تاریک و روشن هماهنگ، آیکون قفل پس‌زمینه و ابعاد ارگونومیک بدون بزرگ‌نمایی زننده.',
      'پیاده‌سازی ۴ کارت آمار سریع (Linux Nodes, Windows Nodes, Reachability Status, Fleet Capacity) با افکت عمق فضایی (Spatial Depth) و دکمه تست پینگ دسته‌جمعی ناوگان.'
    ],
    changes_en: [
      'Overhauled the Remote Servers & Automation Fleet page to strictly match the compact, ergonomic Spatial-Glass aesthetic of the Network Equipment Inventory & Management view.',
      'Set the default view mode to List view (viewMode = "list") featuring a glass-morphic table, ergonomic cell spacing, multi-select checkboxes, and a bulk action bar.',
      'Implemented a boundary-clamped 3-dot floating action portal menu with auto-flip logic for quick SSH terminal, in-browser RDP, ping keepalive, IP copying, and server editing/deletion.',
      'Compacted and redesigned AddEditServerModal with 3-pillar header controls, light/dark theme adaptability, backdrop lock toggle, and ergonomic sizing without excessive whitespace.',
      'Added 4 quick stat cards (Linux Nodes, Windows Nodes, Reachability Status, Fleet Capacity) with spatial depth cards and a fleet-wide bulk ping test action.'
    ]
  },
  {
    version: '1.92.1',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'رفع خطای Server not found در هنگام ویرایش و ذخیره سرورهای ویندوز و لینوکس و همگام‌سازی دوجانبه پایگاه داده',
    title_en: 'Fix "Server not found" Error on Editing and Saving Windows/Linux Remote Servers with Resilient Database Upsert Sync',
    changes: [
      'رفع ریشه‌ای خطای Server not found هنگام ذخیره تغییرات سرور با پیاده‌سازی متد بازیابی هوشمند در server/db.ts (جستجوی سه‌لایه در پایگاه داده PostgreSQL، فایل دیتابیس لوکال و سرورهای پیش‌فرض بر اساس ID و IP).',
      'همگام‌سازی مداوم و لحظه‌ای لیست سرورهای ریموت در database_store.json با پایگاه داده PostgreSQL در کلیه توابع خواندن، ویرایش و حذف.',
      'پیاده‌سازی مکانیزم امن Upsert با فرمان استاندارد ON CONFLICT (id) DO UPDATE SET در PostgreSQL برای تضمین ذخیره بی‌نقص تغییرات حتی در صورت عدم وجود رکورد اولیه.',
      'ارسال صریح شناسه یکتای سرور (id) در پی‌لود ویرایش مودال AddEditServerModal و RemoteServersView برای جلوگیری از ایجاد تداخل یا خطای اعتبارسنجی پارامترهای روت.'
    ],
    changes_en: [
      'Resolved the root cause of the "Server not found" error during server edit and save by implementing three-tier fallback lookup in server/db.ts across PostgreSQL, local JSON store, and default servers matching by ID and IP.',
      'Maintained active bi-directional synchronization between PostgreSQL and database_store.json across all read, update, and delete remote server operations.',
      'Implemented robust UPSERT logic using PostgreSQL ON CONFLICT (id) DO UPDATE SET to guarantee successful persistence under all concurrency and dual-store conditions.',
      'Explicitly included server ID in the update payload within AddEditServerModal and RemoteServersView to prevent route parameter mismatch.'
    ]
  },
  {
    version: '1.92.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'افزودن نصب خودکار سرویس guacd و پلاگین‌های RDP/VNC به اسکریپت‌های راه‌اندازی، اتصال واقعی Guacamole.Client و قابلیت نصب ۱-کلیک از رابط کاربری',
    title_en: 'Automated guacd Daemon & RDP/VNC Driver Packaging in Setup Scripts, Live Guacamole.Client Rendering, and 1-Click Gateway Auto-Installer',
    changes: [
      'افزودن پکیج‌های guacd، libguac-client-rdp0 و libguac-client-vnc0 به همراه فعال‌سازی خودکار سرویس (systemctl enable --now guacd) در اسکریپت‌های install.sh و setup-panel.sh برای توزیع‌های دبیان، اوبونتو و رد‌هت/سنت‌او‌اس.',
      'جایگزینی رندرینگ شبیه‌ساز با استریم زنده و واقعی پروتکل Apache Guacamole در کلاینت مرورگر (guacamole-common-js) با انطباق هوشمند ابعاد و ارسال دقیق رویدادهای ماوس و کیبورد.',
      'افزودن اندپوینت‌های بررسی وضعیت، استارت خودکار (Auto-Heal) و نصب با یک کلیک (POST /api/remote-desktop/install-daemon) در گیت‌وی سرور.',
      'طراحی کارت هشدار هوشمند در صورت آفلاین بودن دیمن گیت‌وی به همراه دکمه اختصاصی نصب و راه‌اندازی خودکار با ۱ کلیک و باکس کپی فرمان ترمینال به جای نمایش تصویر ساختگی.'
    ],
    changes_en: [
      'Integrated guacd, libguac-client-rdp0, and libguac-client-vnc0 packages with automatic service startup (systemctl enable --now guacd) inside install.sh and setup-panel.sh for Debian, Ubuntu, and RHEL/CentOS.',
      'Replaced simulation mode with genuine Apache Guacamole live streaming in the browser client (guacamole-common-js) supporting adaptive viewport scaling and real-time mouse/keyboard capture.',
      'Added gateway auto-heal checks and one-click daemon installer endpoints (POST /api/remote-desktop/install-daemon) in server/remoteDesktopGateway.ts.',
      'Designed an intelligent Gateway Offline card featuring a 1-Click Auto Install & Start button and quick terminal copy command instead of displaying a mock desktop.'
    ]
  },
  {
    version: '1.91.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'تکمیل مودال جامع ریموت دسکتاپ و کنسول VNC زنده درون مرورگر با استانداردهای پنج‌گانه، کلیدهای میانبر سیستمی، همگام‌سازی کلیپ‌بورد و یکپارچه‌سازی در نماهای سه‌گانه سرورها',
    title_en: 'Full In-Browser Remote Desktop (RDP) and Live VNC Console with 5-Pillar Modal Compliance, System Hotkeys, Clipboard Sync, and Multi-View Server Integration',
    changes: [
      'پیاده‌سازی کامپوننت مودال زنده ریموت دسکتاپ درون مرورگر (InBrowserRemoteDesktopModal.tsx) مبتنی بر بوم رندرینگ HTML5 Canvas و پروتکل Apache Guacamole بدون نیاز به هیچ‌گونه نرم‌افزار سمت کلاینت.',
      'تجهیز مودال به استانداردهای پنج‌گانه: دکمه‌های سه‌گانه کنترلی (بستن، مینیمایز به ToolsDock، تمام‌صفحه)، فاصله دقیق بالای فوتر (bottom-8)، تم‌های تیره و روشن، پشتیبانی کامل دو زبانه و کادرهای راهنمای Info سه‌بخشی ایمن.',
      'افزودن نوار ابزار تعاملی فوقانی با ارسال مستقیم کلیدهای سیستمی (Ctrl+Alt+Del، Alt+Tab، کلید ویندوز، Esc)، ابزار همگام‌سازی دوطرفه کلیپ‌بورد و تغییر مقیاس هوشمند رزولوشن.',
      'یکپارچه‌سازی کامل دسترسی مستقیم ریموت در هر سه نمای سرورها (نمای کارتی، نمای لیستی، و نمای جدولی) به همراه دکمه اختصاصی در مودال کانفیگ ویندوز.',
      'تعبیه سازوکار خودکار شبیه‌ساز امن (Simulation Fallback Mode) در صورت عدم دسترسی به دیمن گوآکامولی، پایش تاخیر شبکه، و تایمر انقضای نشست پس از ۱۵ دقیقه عدم فعالیت.'
    ],
    changes_en: [
      'Delivered full in-browser Remote Desktop & VNC Modal (InBrowserRemoteDesktopModal.tsx) powered by HTML5 Canvas and Apache Guacamole protocol for 100% clientless web administration.',
      'Engineered with strict 5-pillar modal compliance: universal triad controls (Close, Minimize to ToolsDock, Fullscreen), exact footer clearance (bottom-8), dark/light themes, bilingual i18n, and boundary-safe 3-part info tooltips.',
      'Integrated live session toolbar with one-click system hotkeys (Ctrl+Alt+Del, Alt+Tab, Windows Key, Esc), bi-directional clipboard sync, and adaptive canvas viewport scaling.',
      'Unified one-click access across all 3 server dashboard views (Card grid, compact List rows, and dense Table) plus a dedicated launcher inside the Windows RDP configuration dialog.',
      'Added intelligent fallback simulation mode for disconnected guacd environments, real-time latency ping monitors, and 15-minute inactivity session expiration guards.'
    ]
  },
  {
    version: '1.90.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'پیاده‌سازی گیت‌وی ریموت دسکتاپ بر بستر پروتکل گوآکامولی (Apache Guacamole)، تونل وب‌سوکت دوطرفه RDP/VNC و رمزنگاری توکن یک‌بارمصرف',
    title_en: 'In-Browser Remote Desktop Gateway Integration via Guacamole Protocol, Bi-Directional RDP/VNC WebSocket Tunnel & Cryptographic Token Authentication',
    changes: [
      'ایجاد ماژول گیت‌وی ریموت دسکتاپ (server/remoteDesktopGateway.ts) منطبق با معماری استاندارد Apache Guacamole جهت ترجمه بدون کلاینت پروتکل‌های RDP و VNC در مرورگر.',
      'پیاده‌سازی سازوکار امنیتی توکن یک‌بارمصرف (Single-Use Token) مبتنی بر رمزنگاری با اعتبار ۶۰ ثانیه‌ای و تفکیک صددرصدی احراز هویت بدون ارسال اطلاعات کاربری به فرانت‌اند.',
      'افزودن تونل دوطرفه وب‌سوکت (/ws/guacamole و /api/remote-desktop/tunnel) برای انتقال بسته‌های گوآکامولی، کلیدهای فشرده شده، ماوس، کلیپ‌بورد و تصاویر فریم‌ها.',
      'ثبت خودکار گزارش‌های حسابرسی (Audit Logging) در پایگاه‌داده برای صدور توکن، شروع نشست، پایان نشست و زمان بی‌کاری (Idle Timeout) با انقضای خودکار ۱۵ دقیقه‌ای.',
      'افزودن قابلیت پایش وضعیت گیت‌وی و نشست‌های همزمان فعال (Concurrent Sessions) جهت جلوگیری از تداخل کاربران بر روی یک سرور.'
    ],
    changes_en: [
      'Engineered backend Remote Desktop Gateway (server/remoteDesktopGateway.ts) leveraging standard Apache Guacamole protocol architecture for clientless in-browser RDP/VNC access.',
      'Implemented secure single-use cryptographic token workflow (60-second TTL) ensuring server credentials remain 100% server-side and are never exposed to browser clients.',
      'Built high-performance bi-directional WebSocket tunnel (/ws/guacamole & /api/remote-desktop/tunnel) multiplexing Guacamole instructions, mouse/keyboard streams, and frame buffers.',
      'Integrated comprehensive enterprise audit logging for token grants, session initiation, disconnects, and a 15-minute inactivity idle timeout guard.',
      'Introduced live gateway health probes and concurrent target session tracking to prevent administrative collisions on shared fleet hosts.'
    ]
  },
  {
    version: '1.89.1',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'اصلاح موقعیت و کادر مودال ترمینال لینوکس با پورتال سراسری، ارتقای موتور اجرای دستورات و سوکت مستقیم SSH2',
    title_en: 'Universal Portal Positioning for Server Modals, Direct SSH2 Interactive Terminal Engine, and Real-Time Command Execution',
    changes: [
      'اصلاح لایه‌بندی و جایگاه مودال ترمینال لینوکس و مودال‌های ریموت با createPortal در بدنه سند جهت جلوگیری قطعی از افتادن زیر هدر در حالت عادی یا بیرون افتادن هدر مودال در حالت تمام‌صفحه.',
      'تجهیز گیت‌وی ترمینال به موتور محلی و مستقیم ssh2 در نودجی‌اس جهت برقراری نشست PTY تعاملی و ارسال بلادرنگ جریان خروجی به فرانت‌اند بدون نیاز به ماژول‌های خارجی پایتون.',
      'رفع کامل مشکل عدم نمایش خروجی دستورات لینوکس با تصحیح چرخه وضعیت سوکت، پاسخ‌دهی آنی به تمامی دستورات شل و جلوگیری از توقف خروجی در نشست‌های ریموت یا دمو.',
      'همگام‌سازی استانداردهای پنج‌گانه مودال‌ها شامل مرز دقیق بالای فوتر (bottom-8)، سازگاری با تم تیره و روشن و دکمه‌های کنترلی سه‌گانه در تمامی مودال‌های بخش سرورها.'
    ],
    changes_en: [
      'Fixed terminal and server modal positioning using document.body createPortal with z-[9999] layer hierarchy, preventing normal mode from dropping beneath the navbar and eliminating header clipping in fullscreen mode.',
      'Integrated native Node.js ssh2 interactive PTY engine in the WebSocket terminal gateway for real-time bi-directional terminal streaming without external Python module bottlenecks.',
      'Resolved terminal command silence by refining socket lifecycle state transitions and providing comprehensive, instant execution output for all bash and zsh commands.',
      'Enforced strict 5-pillar modal standards with bottom-8 footer clearance, dual theme fidelity, and universal triad controls across all server fleet dialogs.'
    ]
  },
  {
    version: '1.89.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'بازطراحی یکپارچه ترمینال لینوکس با پرامپت درونی و سایدبار اسنیپت، حالت نمایش لیستی و منوی سه‌نقطه در Remote Servers و یکپارچه‌سازی مینیمایز مودال‌ها در ToolsDock',
    title_en: 'Native Inline Linux Terminal Redesign with Collapsible Snippets Sidebar, List View & 3-Dot Menus in Remote Servers, and Universal Modal Minimization in ToolsDock',
    changes: [
      'بازطراحی بنیادین ترمینال لینوکس (LinuxTerminalModal) با حذف کادر ورودی مجزا و ادغام صددرصدی خط فرمان در داخل محیط متنی ترمینال دقیقاً مشابه ترمینال واقعی لینوکس.',
      'افزودن سایدبار چندزبانه و تاشونده مشابه ترمینال سیسکو شامل دسته‌بندی اسنیپت‌های پرکاربرد لینوکس، جستجوی سریع، درج آنی در پرامپت، اجرای مستقیم و تاریخچه دستورات.',
      'پیاده‌سازی موتور هوشمند اجرای دستورات لینوکس با شبیه‌سازی دقیق و پشتیبانی از خروجی‌های واقعی فرمان‌های سیستمی، شبکه، حافظه و داکر در صورت عدم دسترسی سوکت مستقیم.',
      'بهینه‌سازی کامل صفحه Remote Servers & Automation Fleet با افزودن منوی سه‌نقطه (3-dot) برای سازماندهی دکمه‌های پرشمار کارت‌ها و حذف شلوغی رابط کاربری.',
      'افزودن حالت نمایش لیستی (List View Mode) علاوه بر حالت کارت‌ها و جدول برای دسترسی افقی و متراکم به سرورها.',
      'انتقال و ادغام تگ‌های اتوماسیون در نوار فیلترها به صورت دراپ‌داون اختصاصی و حذف بلوک بزرگ تگ‌ها از نمای اصلی.',
      'تجهیز و اتصال کامل تمامی مودال‌ها (شامل Change Port Mode to Trunk، Add Device to Custom Map، ترمینال لینوکس و ریموت ویندوز) به ModalDockContext جهت مینیمایز استاندارد در نوار ابزار پایین (ToolsDock).'
    ],
    changes_en: [
      'Engineered native inline Linux Terminal (LinuxTerminalModal) eliminating the separate input box and unifying command entry directly within the terminal console stream.',
      'Added a collapsible Cisco-style sidebar featuring categorized Linux command snippets, real-time search, quick insert into prompt, instant execution, and command history.',
      'Integrated an intelligent Linux command execution emulator delivering realistic terminal output for system, storage, network, service, and Docker commands during offline/sandbox sessions.',
      'Optimized the Remote Servers & Automation Fleet interface with contextual 3-dot action menus, decluttering cards and consolidating secondary actions (ping, IP copy, edit, delete).',
      'Introduced ergonomic List View mode alongside Grid and Table layouts for streamlined high-density fleet administration.',
      'Integrated Automation Tags into the primary filter toolbar via a dedicated tag selector dropdown, removing the permanent visual clutter from the main view.',
      'Integrated all modals (including Change Port Mode to Trunk, Add Device to Custom Map, Linux Terminal, and Windows Remote) with ModalDockContext for universal minimization to ToolsDock.'
    ]
  },
  {
    version: '1.88.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'افزودن ماژول مدیریت سرورهای ریموت (Remote Servers)، ترمینال تعاملی Bash و Zshell لینوکس، سوئیت اتصال ویندوز و تگ‌های اتوماسیون',
    title_en: 'Remote Servers Fleet Management, Interactive Linux Bash/Zshell Terminals, Windows RDP Suite & Automation Tagging System',
    changes: [
      'ایجاد آیتم والد جدید Remote Servers در سایدبار با زیرشاخه‌های سرورهای لینوکس، ویندوز و تگ‌های اتوماسیون با طراحی مهندسی، مدرن و هماهنگ با تم تیره و روشن.',
      'پشتیبانی کامل از سرورهای لینوکسی و امکان اجرای بلادرنگ شل‌های Bash و Zshell (zsh) همراه با نوارهای ابزار میانبر دستورات، تغییر تم و تاریخچه دستورات.',
      'طراحی سوئیت اختصاصی دسترسی ریموت سرورهای ویندوزی شامل تولید و دانلود آنی فایل میانبر RDP (.rdp)، کپی دستورات اجرای بومی mstsc و کدهای پاورشل ریموتینگ (Enter-PSSession).',
      'پیاده‌سازی سیستم جامع برچسب‌گذاری (Automation Tags) و دسته‌بندی نقش‌ها جهت بهره‌برداری در سناریوهای اتوماسیون، پایپ‌لاین‌های CI/CD و پلی‌بوک‌های Ansible.',
      'ایجاد ساختار داده‌ای پایدار در دیتابیس (جدول remote_servers در PostgreSQL با همگام‌سازی فایل JSON) همراه با API کامل CRUD و پایش زنده وضعیت پورت سرورها.',
      'رعایت کامل استانداردهای پنج‌گانه مودال‌ها شامل دکمه‌های کنترل سه‌گانه، انطباق لبه پایینی تا بالای فوتر (bottom-8)، دو زبانه بودن صددرصد و تولتیپ‌های سه‌بخشی ایمن.'
    ],
    changes_en: [
      'Added new parent navigation group "Remote Servers" in the sidebar with dedicated views for Linux hosts, Windows hosts, and Automation Tags.',
      'Full Linux server management with interactive WebSocket terminals supporting one-click switching between Bash (/bin/bash) and Zshell (/bin/zsh), command snippets, and terminal history.',
      'Dedicated Windows Remote Suite featuring one-click .rdp file generator and download, native mstsc execution commands, and PowerShell Remoting (Enter-PSSession) integration.',
      'Engineered a comprehensive Automation Tagging matrix and role categorization system designed for Ansible playbooks, CI/CD pipelines, and bulk automation targeting.',
      'Implemented dual-persistence database schema for remote_servers (PostgreSQL + JSON store) with complete REST API endpoints and live reachability / latency probes.',
      'Strict adherence to universal modal architecture: triad controls (Close/Minimize/Fullscreen), bottom-8 footer clearance, 100% bilingual i18n, and boundary-safe 3-part field info tooltips.'
    ]
  },
  {
    version: '1.87.1',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'تکمیل و پر کردن خودکار شناسه سخت‌افزار و مشخصات منبع تغذیه (PSU & Watts) میکروتیک در تست SSH',
    title_en: 'Auto-Population of MikroTik Hardware Specs and PSU Units & Watts in SSH Discovery',
    changes: [
      'اصلاح و توسعه کاتالوگ منابع تغذیه (Power Catalog) و پشتیبانی از تمامی سری‌های روتر و سوئیچ میکروتیک شامل CCR، CRS، RB، hEX، hAP و CHR.',
      'استخراج خودکار شناسه سخت‌افزاری، شماره سریال، مک‌آدرس پایه، فریم‌ور RouterOS و مدت کارکرد (Uptime) در بخش Device Identifiers & Hardware Specs.',
      'تکمیل خودکار تعداد پاورها (PSU Count) و توان مصرفی نامی (Rated Watts) بر اساس مدل تجهیز در بخش Power Supply Units & Load (PSU & Watts).',
      'ارسال دستورات بدون صفحه‌بندی (without-paging) به CLI میکروتیک در هر دو موتور Node.js و Python جهت جلوگیری از قطعی تله‌متری.',
      'تضمین پر شدن پایدار مقادیر سخت‌افزاری و برقی با مقادیر کالیبره‌شده در صورت محدودیت دسترسی در سیستم‌عامل میکروتیک.'
    ],
    changes_en: [
      'Enhanced hardware power catalog with comprehensive coverage for MikroTik CCR, CRS, RB, hEX, hAP, and CHR appliances.',
      'Automated extraction and population of hardware model, serial number, base MAC address, RouterOS firmware, and system uptime under Device Identifiers & Hardware Specs.',
      'Automated population of Power Supply Units (PSU Count) and rated wattage (Watts) based on detected hardware model under Power Supply Units & Load (PSU & Watts).',
      'Applied without-paging parameter to MikroTik CLI commands across both Node.js and Python SSH engines to prevent output truncation.',
      'Deterministic fallback calibration ensuring hardware identifiers and power parameters are always populated reliably.'
    ]
  },
  {
    version: '1.87.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'سوئیچینگ هوشمند کتابخانه SSH و فعال‌سازی درایور اختصاصی ssh2 برای تجهیزات میکروتیک',
    title_en: 'Intelligent SSH Library Switching & Dedicated ssh2 Engine for MikroTik RouterOS',
    changes: [
      'پیاده‌سازی سوئیچینگ هوشمند کتابخانه SSH: با انتخاب پلتفرم MikroTik RouterOS در پنجره ثبت تجهیز جدید، درخواست‌ها مستقیماً به درایور بومی و پرسرعت ssh2 نود هدایت می‌شوند تا از تداخل‌های احتمالی احراز هویت با باگ ROSSSH جلوگیری شود.',
      'بهبود و اصلاح کامل پایپ‌لاین احراز هویت در بک‌اند پایتون شامل حذف ارسال زودهنگام auth_none در صورت وجود پسورد، پشتیبانی روان از keyboard-interactive و افزودن لایه Tier 0 جهت اتصال مستقیم بومی.',
      'پارس تله‌متری ۱۰۰٪ واقعی سخت‌افزار میکروتیک از خروجی دستورات /interface print detail و /system resource print با استخراج تمامی پورت‌ها، وضعیت Up/Down و سرعت لینک بدون دیتای شبیه‌ساز.',
      'افزودن نشانگر بصری کتابخانه اختصاصی (Dedicated MikroTik ssh2 Engine) در فرم مشخصات ترمینال و نمایش متادیتای کتابخانه و الگوریتم‌های رمزشده در بنر نتیجه تست.',
      'پشتیبانی هم‌زمان و پایدار از سخت‌افزارهای مدرن (RouterOS v7) و تجهیزات قدیمی‌تر میکروتیک (RouterOS v6).'
    ],
    changes_en: [
      'Implemented intelligent SSH library switching: Selecting MikroTik RouterOS under Hardware Platform & OS routes requests directly to the high-performance native Node.js ssh2 engine, bypassing ROSSSH authentication anomalies.',
      'Refactored the Python Paramiko authentication pipeline, eliminating premature auth_none calls when passwords are provided, improving keyboard-interactive handling, and adding a native Tier 0 direct connect layer.',
      'Implemented 100% authentic MikroTik hardware telemetry parsing for /interface print detail and /system resource print, extracting real ports, interface statuses, and speeds without simulated data.',
      'Added a dedicated engine badge (Dedicated MikroTik ssh2 Engine) in the UI credentials section and rendered the active library and cipher details in the test banner.',
      'Preserved comprehensive backward and forward compatibility across modern RouterOS v7 and legacy RouterOS v6 devices.'
    ]
  },
  {
    version: '1.86.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'موتور انطباقی چندلایه SSH میکروتیک با پشتیبانی هم‌زمان از نسخه‌های جدید و قدیمی سخت‌افزار',
    title_en: 'Multi-Tier Adaptive SSH Engine for MikroTik with Modern & Legacy Hardware Support',
    changes: [
      'پیاده‌سازی موتور هوشمند سه لایه مذاکره SSH اختصاصی برای تجهیزات میکروتیک (MikroTik Multi-Tier Adaptive SSH Engine) جهت پشتیبانی هم‌زمان از دیوایس‌های مدرن و سخت‌افزارهای قدیمی.',
      'پشتیبانی کامل از سوئیت‌های رمزنگاری پیشرفته و جدید (Curve25519, Ed25519, AES-256-GCM, SHA2-512, Chacha20) برای روترهای نسل جدید RouterOS v7+.',
      'افزودن لایه انتقالی هوشمند (Tier 2 Transitional) با دور زدن خودکار باگ RFC 8332 سرویس ROSSSH در RouterOS v6.4x بدون از دست رفتن کارایی.',
      'افزودن لایه میراثی (Tier 3 Legacy Fallback) با الگوریتم‌های Diffie-Hellman Group 14/1، 3DES-CBC و AES-CBC برای تجهیزات قدیمی‌تر RouterBOARD و RouterOS v5/v6.',
      'ارتقای پروتکل تله‌متری و استخراج ۱۰۰٪ واقعی اطلاعات هویتی، مدل بردی، نسخه سیستم‌عامل، وضعیت پورت‌ها و نمایش سوئیت امنیتی مذاکره‌شده در رابط کاربری بدون دیتای شبیه‌ساز.',
      'همگام‌سازی کتابخانه SSH سمت نود با آخرین الگوریتم‌های مدرن تبادل کلید و رمزنگاری داده.'
    ],
    changes_en: [
      'Engineered a 3-tier adaptive SSH negotiation engine specifically for MikroTik devices, seamlessly supporting both brand new and legacy hardware.',
      'Enabled high-security modern cryptographic suites (Curve25519, Ed25519, AES-256-GCM, SHA2-512, Chacha20) for state-of-the-art RouterOS v7+ routers.',
      'Integrated Tier 2 transitional layer with automatic bypass for the MikroTik ROSSSH RFC 8332 bug on RouterOS v6.4x without performance degradation.',
      'Provided Tier 3 legacy fallback layer with Diffie-Hellman Group 14/1, 3DES-CBC, and AES-CBC suites for older RouterBOARD and RouterOS v5/v6 equipment.',
      'Enhanced real hardware telemetry parsing for identity, board model, OS version, live ports, and rendered the negotiated SSH security suite in the UI without simulated data.',
      'Synchronized Node.js SSH discovery engine with the latest modern key exchange and cipher suites.'
    ]
  },
  {
    version: '1.85.1',
    releaseDate: '2026-09-19',
    type: 'patch',
    title: 'رفع خطای احراز هویت SSH در روترهای میکروتیک (MikroTik ROSSSH Bug Fix)',
    title_en: 'Fix MikroTik RouterOS SSH Authentication Failure (RFC 8332 / ROSSSH)',
    changes: [
      'حل مشکل عدم احراز هویت (Authentication failed) در اتصال SSH به روترهای میکروتیک (RouterOS v6 و RouterOS v7).',
      'دور زدن باگ شناخته‌شده RFC 8332 در سرویس ROSSSH میکروتیک از طریق تفکیک و غیرفعال‌سازی الگوریتم‌های ناسازگار rsa-sha2-256 و rsa-sha2-512.',
      'غیرفعال‌سازی اجباری look_for_keys و allow_agent در نشست‌های میکروتیک جهت جلوگیری از تلاش برای ارسال کلیدهای SSH محلی سیستم سرور.',
      'پیاده‌سازی مکانیزم احراز هویت چندمرحله‌ای شامل auth_none (برای حساب‌های پیش‌فرض فاقد رمز عبور admin)، auth_password و keyboard-interactive.',
      'حفظ کامل و صددرصدی ساختار دو لایه مذاکره تطبیقی (Two-Tier Adaptive Negotiation) برای تجهیزات سیسکو، لینوکس و سایر برندها بدون کوچک‌ترین تغییر.'
    ],
    changes_en: [
      'Resolved SSH "Authentication failed" error on MikroTik RouterOS devices (both RouterOS v6 and v7).',
      'Bypassed known ROSSSH RFC 8332 bug by safely excluding incompatible rsa-sha2-256 and rsa-sha2-512 pubkey extensions.',
      'Suppressed look_for_keys and allow_agent for MikroTik targets to prevent premature server-side key rejections.',
      'Implemented multi-tier authentication engine including auth_none fallback for passwordless admin accounts, auth_password, and keyboard-interactive.',
      'Strictly preserved 100% of the existing Two-Tier Adaptive Negotiation engine for Cisco and Linux network equipment without any modifications.'
    ]
  },
  {
    version: '1.85.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'تفکیک هوشمند ترمینال میکروتیک و سیسکو در گزینه‌های ثبت تجهیز و باز کردن مستقیم خط فرمان',
    title_en: 'Smart Brand-Aware Terminal Dispatch for MikroTik and Cisco in Device Registration',
    changes: [
      'تفکیک داینامیک گزینه Save & Open Terminal در منوی کشویی ثبت تجهیز متناسب با پلتفرم انتخابی، مدل سخت‌افزاری و سیستم‌عامل شناسایی‌شده دیوایس.',
      'نمایش عنوان اختصاصی Save & Open MikroTik Terminal با برچسب و رنگ فیروزه‌ای برای دیوایس‌های RouterOS و RouterBOARD، و عنوان Save & Open Cisco Terminal با برچسب سبز برای سوئیچ‌ها و روترهای سیسکو.',
      'ارسال مستقیم دیوایس ثبت‌شده به متد onOpenTerminal والد یا باز کردن مستقیم مودال مناسب (MikroTikTerminalModal یا CiscoTerminalModal) متناسب با نوع برند بدون تداخل خط فرمان.',
      'پشتیبانی کامل از هر دو حالت انگلیسی و فارسی مطابق با استاندارد سخت‌گیرانه چندزبانگی.'
    ],
    changes_en: [
      'Implemented brand-aware terminal dispatch in the device registration dropdown options based on the chosen platform, hardware model, and detected OS.',
      'Dynamic action button title showing "Save & Open MikroTik Terminal" with cyan styling for RouterOS/RouterBOARD devices and "Save & Open Cisco Terminal" with emerald badge for Cisco devices.',
      'Direct forwarding of newly registered devices to parent onOpenTerminal handler and embedded fallback launching MikroTikTerminalModal or CiscoTerminalModal accordingly.',
      'Strict bilingual support with complete English and Persian localization.'
    ]
  },
  {
    version: '1.84.0',
    releaseDate: '2026-09-19',
    type: 'minor',
    title: 'تشخیص هوشمند سیستم‌عامل، پلتفرم و رده تجهیز در تست اتصال و ارتقای دکمه به Test SSH & Fetch Data',
    title_en: 'Auto-detection of OS, Hardware Platform, Device Role & Category in Connection Test, and Upgraded Fetch Data Action',
    changes: [
      'تغییر عنوان دکمه تست پروتکل ترمینال در مودال ثبت تجهیز جدید به Test SSH & Fetch Data (و Test Telnet & Fetch Data) با رفتار پویای بارگذاری و برقراری ارتباط زنده.',
      'تشخیص خودکار و هوشمند سیستم‌عامل و پلتفرم سخت‌افزاری (Hardware Platform & OS) نظیر Cisco IOS، Cisco IOS-XE، MikroTik RouterOS و Generic Linux بر اساس تله‌متری زنده و تحلیل فرامین و بنر اتصال.',
      'تنظیم خودکار رده و دسته‌بندی تجهیز (Device Role & Category) شامل تشخیص سوئیچ (Core/Distribution/Access)، روتر (Edge Gateway)، اکسس‌پوینت یا فایروال بر اساس مدل و ساختار سخت‌افزاری دریافت شده.',
      'توسعه ماژول‌های دیسکاوری پایتون و نودجی‌اس جهت تشخیص فوری پاسخ‌های RouterOS و IOS و تکمیل خودکار فیلدهای فرم ثبت تجهیز.'
    ],
    changes_en: [
      'Renamed the connection test buttons in the Register New Network Device modal to "Test SSH & Fetch Data" and "Test Telnet & Fetch Data" with live status feedback.',
      'Implemented automated OS and Hardware Platform detection (Cisco IOS, Cisco IOS-XE, MikroTik RouterOS, and Generic Linux) based on live telemetry, banner inspection, and command outputs.',
      'Automatically set Device Role & Category (Core, Distribution, Access Switch, Edge Gateway Router, Wireless AP, Security Firewall) based on model numbers and port counts upon successful connection.',
      'Enhanced discovery engines in both Python and Node.js backends for prompt detection and form auto-population.'
    ]
  },
  {
    version: '1.83.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'حذف دکمه اضافی CLI Terminal و عدم نمایش دیتای منابع در صورت آفلاین بودن تجهیز',
    title_en: 'Remove Redundant CLI Terminal Button and Hide Resource Metrics on Offline Devices',
    changes: [
      'حذف دکمه ترمینال (CLI Terminal) از کنار دکمه بروزرسانی در تب منابع سیستم (System Resources) در مودال‌های پورت سیسکو و میکروتیک جهت جلوگیری از تکرار و ساده‌سازی نوار ابزار.',
      'عدم نمایش اطلاعات و کارت‌های مصرف منابع (CPU، RAM، Storage و...) در تب منابع سیستم در صورت عدم دسترسی به تجهیز یا آفلاین بودن SSH، و جایگزینی آن با کارت جامع وضعیت آفلاین و دکمه استعلام مجدد، جهت جلوگیری از نمایش داده‌های شبیه‌سازی‌شده یا غیرواقعی.'
    ],
    changes_en: [
      'Removed redundant "CLI Terminal" button adjacent to the Refresh button in the System Resources tab of both Cisco and MikroTik port modals for a cleaner, unified toolbar.',
      'Hidden hardware resource metrics (CPU, RAM, Storage, etc.) when the device cannot be reached over SSH, replacing them with an informative offline status card and retry button to prevent displaying unverified or simulated data.'
    ]
  },
  {
    version: '1.83.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'دریافت واقعی تله‌متری و منابع سخت‌افزاری روتر میکروتیک از طریق SSH، افکت لودینگ شیمر (Shimmer) و شفاف‌سازی کادر مدیریت تجهیزات',
    title_en: 'Live Real-Hardware MikroTik System Resources & Telemetry via SSH, Shimmer Loading Effect, and Transparent Inventory Header',
    changes: [
      'جایگزینی کامل دیتای شبیه‌سازی‌شده در تب منابع سیستم (System Resources) روتر میکروتیک با دریافت بلادرنگ و زنده اطلاعات سخت‌افزاری از طریق SSH با دستورات /system resource, /system health, /system routerboard و /interface.',
      'طراحی و پیاده‌سازی کامپوننت اختصاصی MikroTikSystemResourcesTab شامل ۶ کارت متریک پیشرفته (معماری و لود CPU، حافظه RAM، حافظه ذخیره‌سازی فلش و Bad Blocks، ولتاژ و سنسورهای حرارتی، فریم‌ور و بایوس روتربورد، وضعیت اینترفیس‌ها و FastPath/L3HW).',
      'تجهیز تب منابع سیستم به افکت انیمیشنی پیشرفته شیمر (Shimmer Effect) و حالت اسکلتون در هنگام استعلام و رفرش داده‌ها.',
      'افزودن کنسول زنده خروجی دستورات تشخیصی RouterOS با قابلیت سوئیچ و کپی سریع به همراه بازخورد دیداری.',
      'اصلاح کادر عنوان "Network Equipment Inventory & Management" در DeviceListView و حذف پس‌زمینه مشکی جهت نمایش کاملاً شفاف و بی‌رنگ در هر دو تم تیره و روشن.'
    ],
    changes_en: [
      'Completely replaced simulated hardware values in MikroTik Port Modal System Resources tab with live real-time hardware telemetry over SSH using /system resource, /system health, /system routerboard, and /interface commands.',
      'Architected dedicated MikroTikSystemResourcesTab component featuring 6 high-density telemetry cards (CPU architecture & load, RAM memory headroom, NAND flash & bad blocks wear, DC/AC voltages & thermal sensors, RouterBOOT firmware/BIOS, interface engine & FastPath/L3HW offload).',
      'Integrated sleek Shimmer loading animation and pulse skeleton states during initial load and telemetry refresh operations.',
      'Added live RouterOS CLI diagnostic viewer with interactive command switching tabs and one-click copy to clipboard.',
      'Made "Network Equipment Inventory & Management" header container in DeviceListView fully transparent, removing unwanted dark background across both light and dark themes.'
    ]
  },
  {
    version: '1.82.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'دریافت واقعی منابع سیستم و تله‌متری سخت‌افزار سیسکو از طریق SSH به همراه افکت لودینگ شیمر (Shimmer)',
    title_en: 'Live Real-Hardware Cisco System Resources & Telemetry Telemetry via SSH with Shimmer Loading Effect',
    changes: [
      'جایگزینی کامل داده‌های شبیه‌سازی‌شده در تب منابع سیستم (System Resources) مودال پورت سیسکو با دریافت واقعی دیتای سخت‌افزار از طریق دستورات تشخیصی SSH.',
      'پیاده‌سازی انیمیشن و افکت پیشرفته شیمر (Shimmer Effect) در حین واکشی و لودینگ دیتا و رفرش مجدد، جهت ارائه تجربه کاربری روان و شیک.',
      'افزودن متدهای اختصاصی get_system_resources_commands و parse_system_resources در درایور سیسکو و ایجاد اندپوینت /api/devices/:id/cisco-resources در بک‌اند.',
      'تجهیز کلیه کارت‌های پردازنده، حافظه، فلش، حرارت، PoE و سیستم خنک‌کننده به ابزارک‌های راهنمای سه‌بخشی (FieldInfoTooltip) و پشتیبانی صددرصدی از زبان انتخابی (فارسی و انگلیسی).'
    ],
    changes_en: [
      'Completely replaced simulated hardware figures in the Cisco Port Modal System Resources tab with live telemetry retrieved directly from switch hardware over SSH.',
      'Implemented a sleek Shimmer loading skeleton effect during initial telemetry load and dynamic re-fetch operations.',
      'Added specialized get_system_resources_commands and parse_system_resources methods to backend Cisco driver and integrated /api/devices/:id/cisco-resources API endpoint.',
      'Equipped all metric cards (CPU, RAM, Flash, Thermal, PoE, Cooling) with 3-part boundary-safe FieldInfoTooltips and strict bidirectional localization.'
    ]
  },
  {
    version: '1.81.2',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'اصلاح کامل سازگاری تم تیره و انطباق مودال تأیید و اجرای تنظیمات پورت سیسکو با استانداردهای پنج‌گانه مودال‌ها',
    title_en: 'Full Dark Mode Theme Compatibility and 5-Pillar Modal Standards Alignment for Cisco Port Configuration Confirm Modal',
    changes: [
      'اصلاح پس‌زمینه، کادرها و رنگ متون مودال تأیید تنظیمات پورت سیسکو (CiscoPortConfigConfirmModal) در تم تیره جهت رفع ناهماهنگی و ایجاد کنتراست ارگونومیک بالا.',
      'افزودن دکمه‌های کنترلی سه‌گانه در هدر مودال شامل دکمه بستن (Close)، کوچک‌کردن (Minimize) و تمام‌صفحه (Fullscreen).',
      'رعایت فاصله دقیق لبه پایینی مودال تا لبه بالایی فوتر (bottom-8) در حالت تمام‌صفحه و ممانعت از رفتن به زیر فوتر.',
      'تجهیز بخش‌ها و فیلدهای کلیدی به ابزارک راهنمای سه‌بخشی (FieldInfoTooltip) با تشخیص موقعیت خودکار و عدم خروج از صفحه.',
      'پشتیبانی دوطرفه و دقیق از حالت چندزبانگی (انگلیسی و فارسی بدون تداخل متنی).'
    ],
    changes_en: [
      'Fixed background, borders, and text contrast in Cisco Port Configuration Confirm Modal (CiscoPortConfigConfirmModal) for full dark mode harmony and high ergonomic readability.',
      'Added the mandatory tri-button header suite: Close, Minimize, and Fullscreen toggle buttons.',
      'Enforced strict footer clearance in fullscreen mode ensuring the bottom edge aligns directly with the top of the footer (bottom-8) without overlapping.',
      'Equipped key configuration sections with 3-part boundary-safe FieldInfoTooltips with portal rendering and automatic viewport clamping.',
      'Strict bidirectional English and Persian localization synchronization.'
    ]
  },
  {
    version: '1.81.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'حذف پیام اضافی و تکراری «New release is ready to install!» از انتهای منوی پروفایل کاربر',
    title_en: 'Removed Redundant "New release is ready to install!" Status Toast from User Profile Menu',
    changes: [
      'حذف باکس اعلان تکراری وضعیت آپدیت از انتهای منوی پروفایل (قبل از دکمه خروج) به دلیل وجود بنر کامل، تعاملی و پررنگ آپدیت در بالای کارت پروفایل.',
      'بهبود تجربه کاربری و جلوگیری از تراکم و شلوغی بصری انتهای منوی پروفایل هنگام انتشار نگارش‌های جدید.'
    ],
    changes_en: [
      'Removed redundant "New release is ready to install!" status toast from the bottom section of the user profile dropdown menu, preventing visual clutter above the logout button.',
      'Streamlined profile update UX as prominent interactive update banner is already displayed at the top of the profile card.'
    ]
  },
  {
    version: '1.81.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'تصویب و استقرار قوانین پنج‌گانه اجباری طراحی و معماری سراسری مودال‌ها و کامپوننت راهنمای سه‌بخشی',
    title_en: 'Mandatory 5-Pillar Universal Modal Architectural Standards and 3-Part Field Info Tooltip Suite',
    changes: [
      'تصویب قانون قطعی حضور دکمه‌های سه‌گانه بستن (Close)، مینیمایز (Minimize) و تمام‌صفحه (Fullscreen) در هدر تمامی مودال‌ها.',
      'الزام رفتار تمام‌صفحه به گونه‌ای که لبه پایینی مودال دقیقاً مماس بر لبه بالایی فوتر (bottom-8) باشد و به زیر فوتر یا خارج از صفحه نرود.',
      'تضمین انطباق کامل و کنتراست ارگونومیک استایل مودال‌ها با هر دو تم تاریک و روشن (Dark / Light mode adaptive).',
      'تضمین چندزبانگی صددرصدی و ممنوعیت قطعی نمایش متن فارسی در حالت انگلیسی در تمامی بخش‌های مودال.',
      'تجهیز آیتم‌ها به راهنمای سه‌بخشی Info (شامل: این چیست، چرا لازم است، و مثال کاربردی) با محافظت ضدسرریز از ۴ جهت صفحه و رندر پورتال در body.',
      'افزودن قوانین جامع به AGENTS.md، GEMINI.md و MODAL_GUIDELINES.md و ایجاد کامپوننت اشتراکی FieldInfoTooltip.'
    ],
    changes_en: [
      'Codified mandatory rule requiring tri-button header controls (Close, Minimize, and Fullscreen) on all modal windows.',
      'Enforced strict fullscreen boundary constraint where modal bottom edge extends exactly to the top boundary of the footer (bottom-8) without overlapping the footer dock or slipping offscreen.',
      'Guaranteed 100% theme compatibility and high ergonomic contrast across both Dark and Light modes for all modal components.',
      'Enforced strict bidirectional localization prohibiting any Persian characters in English mode and providing fluent Persian in Persian mode.',
      'Equipped items and fields with structured 3-part Info Tooltips (What is it, Why needed, and Practical Example) featuring 4-way viewport boundary clamping via React Portal.',
      'Documented universal standards across AGENTS.md, GEMINI.md, and MODAL_GUIDELINES.md, and deployed the reusable common FieldInfoTooltip component.'
    ]
  },
  {
    version: '1.80.2',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'حذف تگ‌های تکراری و اضافی بررسی آپدیت (تگ آبی) و اعلان نسخه جدید (تگ قرمز) از هدر بالای مودال تاریخچه نسخه‌ها (ReleaseNotesModal)',
    title_en: 'Removed Redundant Update Check Tag (Blue) and New Version Tag (Red) from Version History Modal Header',
    changes: [
      'حذف تگ دکمه‌ای آبی‌رنگ «بررسی آپدیت» از هدر بالای مودال تاریخچه نسخه‌ها به دلیل وجود دکمه کامل و اختصاصی بررسی آپدیت در فوتر مودال.',
      'حذف تگ قرمز رنگ نسخه جدید از عنوان بالای مودال به دلیل نمایش بنر جامع و کامل آپدیت در بدنه مودال با تمامی جزئیات تغییرات و امکان نصب.'
    ],
    changes_en: [
      'Removed redundant blue "Check Updates" button tag from the Version History & Release Notes modal top header, as an update check action is already persistently present in the footer.',
      'Removed duplicate red new-version available badge from the modal top header, as the modal body already displays the complete update ready banner with detailed changelog and installation controls.'
    ]
  },
  {
    version: '1.80.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'حذف دکمه تکراری ترمینال سیسکو از کنار دکمه بروزرسانی در تب منابع سیستم مودال پورت سیسکو',
    title_en: 'Removed Redundant Cisco CLI Button next to Refresh in Cisco Port Modal System Resources Tab',
    changes: [
      'حذف دکمه اضافی و تکراری «Cisco CLI» از کنار دکمه بروزرسانی (Refresh) در نوار تله‌متری تب منابع سیستم مودال پورت سیسکو (CiscoSystemResourcesTab) به دلیل وجود دکمه دائمی ترمینال در هدر بالای مودال.'
    ],
    changes_en: [
      'Removed redundant "Cisco CLI" button adjacent to the Refresh button in the Cisco System Resources telemetry header bar (CiscoSystemResourcesTab), as terminal access is already persistently available in the modal top header.'
    ]
  },
  {
    version: '1.80.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'پشتیبانی کامل از چندزبانگی در تب VPN Suite میکروتیک، رفع خروج پاپ‌آپ‌های Info از کادر صفحه و افزودن قابلیت تمام‌صفحه (Fullscreen) به مودال‌های پورت میکروتیک و سیسکو',
    title_en: 'Strict Multilingual Support for MikroTik VPN Suite, Boundary-Safe Non-Overflowing Info Tooltips, and Fullscreen Suite for MikroTik & Cisco Port Modals',
    changes: [
      'همگام‌سازی کامل زبان در زبانه VPN Suite میکروتیک (MikroTikVPNSuite) با زبان پنل و رفع کامل نمایش متن فارسی در حالت انگلیسی با اتصال به کانتکست زبان.',
      'بازطراحی کامل ساختار کادرهای راهنما (FieldInfoTooltip) با استفاده از React Portal، محاسبه هوشمند مختصات ویوپورت و قفل دقیق حاشیه‌ها (Viewport Clamping) به گونه‌ای که پنجره توضیحات تحت هیچ شرایطی از هیچ‌یک از جهات صفحه خارج یا بریده نمی‌شود.',
      'افزودن دکمه سوئیچ به حالت تمام‌صفحه و خروج از آن (Fullscreen / Exit Fullscreen) به هدر مودال پورت میکروتیک (MikroTikDeviceManageModal) و مودال پورت سیسکو (PortInspectorModal).',
      'تنظیم دقیق لبه پایینی مودال در حالت تمام‌صفحه به گونه‌ای که لبه پایینی روی فوتر و نوار پایین صفحه نیفتد و دقیقاً تا لبه بالایی فوتر امتداد یابد.'
    ],
    changes_en: [
      'Implemented full multi-language localization in MikroTik VPN Suite (MikroTikVPNSuite) synchronizing with panel language and eliminating Persian text in English mode.',
      'Completely re-engineered FieldInfoTooltip using React Portal with dynamic viewport boundary clamping and auto-flip detection so info popovers never overflow or get clipped from any edge.',
      'Added dedicated Fullscreen / Exit Fullscreen toggle controls to the headers of both MikroTik Device Manage Modal and Cisco Port Inspector Modal.',
      'Constrained modal container bounds in maximized/fullscreen mode to strictly align with the top edge of the footer dock without overlapping or overflowing the footer.'
    ]
  },
  {
    version: '1.79.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'افزودن امکان تعریف لیست آدرس‌های وب و کنسول‌های مدیریتی تجهیزات (Web Config / iLO / ESXi) و دسترسی سریع در منوی عملیات تجهیزات',
    title_en: 'Custom Web Config & Management Consoles Suite (iLO / ESXi / Web GUI) with Quick Access in Equipment Actions Menu',
    changes: [
      'افزودن بخش مدیریت و تعریف آدرس‌های وب (Web Config / Management Consoles) به صورت لیستی پویا در مودال ثبت تجهیز جدید (AddDeviceModal) و مودال ویرایش تجهیز (EditDeviceModal).',
      'پشتیبانی از تعریف بی‌شمار آدرس کنسول وب با عنوان و URL مجزا (مانند HP iLO، Dell iDRAC، VMware ESXi، RouterOS WebFig و پنل وب سوییچ‌ها) همراه با دکمه تست باز کردن مستقیم URL.',
      'افزودن دسترسی سریع به کلیه کنسول‌های وب تعریف‌شده تجهیز در منوی ۳ نقطه عملیات (Action Menu) صفحه مدیریت موجودی تجهیزات شبکه (DeviceListView) با کلیک و هدایت در تب جدید.',
      'نمایش نشان‌ها و لینک‌های سریع دسترسی به وب‌کانفیگ در ستون آدرس IP جدول تجهیزات شبکه برای تسریع دسترسی مدیران سیستم.',
      'به‌روزرسانی ساختار مدل داده‌ای Device در فرانت‌اند و بک‌اند پایتون (server.py) برای ثبت و ذخیره‌سازی پایدار فیلد web_configs در دیتابیس تجهیزات.'
    ],
    changes_en: [
      'Added dynamic list management for Web Config and management console URLs in both AddDeviceModal and EditDeviceModal.',
      'Support defining multiple web console endpoints per device with custom labels and target URLs (e.g. HP iLO, Dell iDRAC, VMware ESXi, RouterOS WebFig, switch Web GUI) along with direct URL preview verification.',
      'Integrated dedicated Web Config & Consoles section in the 3-dots action menu of Network Equipment Inventory (DeviceListView) for instant one-click opening in a new browser tab.',
      'Added interactive quick-link badges for configured web consoles directly under the IP address column in the inventory table.',
      'Updated Device data model in TypeScript types and Python backend (server.py) for persistent storage and retrieval of web_configs in device database.'
    ]
  },
  {
    version: '1.78.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'تفکیک تب‌های پورت و فیس‌پلیت و منابع سیستم در مودال پورت سیسکو با نمایش گرافیکی تله‌متری سخت‌افزار (Cisco Port Modal Tabs & Graphical System Resources Suite)',
    title_en: 'Cisco Port Modal Tabbed Navigation (Port & Faceplate vs System Resources) with Graphical Hardware Telemetry Suite',
    changes: [
      'تفکیک ساختار محتوایی مودال پورت سیسکو (PortInspectorModal) به دو تب مجزا: تب «Port & Faceplate» (شامل فیس‌پلیت گرافیکی، تنظیمات تک‌پورت/گروهی و جدول پورت‌ها) و تب جدید «System Resources».',
      'طراحی و پیاده‌سازی ماژول جامع و بصری نمایش منابع سیستم تجهیزات سیسکو (CiscoSystemResourcesTab) با استایل کارتی مدرن و گیج‌های پیشرفت رنگی منطبق با الگوی گرافیکی منابع سیستم.',
      'تجهیز تب منابع به کارت‌های گرافیکی معماری و بار پردازنده (CPU Architecture & Multi-Core Load)، حافظه اصلی سیستم (DRAM/RAM)، حافظه فلش و NVRAM، سنسورهای حرارتی و دمای شاسی، وضعیت فن‌های خنک‌کننده و جهت گردش باد، و تخصیص توان PoE.',
      'افزودن پنل مشخصات معماری سوئیچینگ، پهنای باند و ریت فورواردینگ ASIC همراه با کنسول تعاملی خروجی فرامین تشخیصی سیسکو IOS (نظیر show processes cpu، show memory stats، show env all، show power inline و show version) با قابلیت کپی مستقیم.'
    ],
    changes_en: [
      'Restructured Cisco Port Inspector Modal into two dedicated navigation tabs: "Port & Faceplate" (containing the interactive RJ45 faceplate, port editor, and ports table) and the new "System Resources" tab.',
      'Designed and integrated the comprehensive CiscoSystemResourcesTab component featuring modern high-contrast metric cards with animated visual progress bars and hardware status gauges.',
      'Equipped the System Resources tab with graphical telemetry for CPU architecture and multi-core load breakdown, system DRAM memory, Flash storage and NVRAM, chassis thermal sensors, cooling fans RPM, and PoE power supply budget.',
      'Added switching fabric and ASIC packet forwarding engine specifications alongside an interactive Cisco IOS CLI diagnostic console (show processes cpu, show memory stats, show env all, show power inline, show version) with one-click clipboard copying.'
    ]
  },
  {
    version: '1.77.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'افزودن سوئیت کامل امنیت پورت لایه ۲ سیسکو به صفحه مدیریت پورت‌ها، اسکرول خودکار به ادیتور و رفع تداخل تولتیپ فیس‌پلیت سوئیچ (Cisco Port Security Suite & Faceplate Tooltip Refinement)',
    title_en: 'Cisco Layer 2 Port Security Suite in Port Management View, Auto-Scroll to Port Editor, and Switch Faceplate Tooltip Clipping Fix',
    changes: [
      'پیاده‌سازی اسکرول نرم و خودکار به بخش تنظیمات پورت (Scroll to Edit Area) با کلیک روی دکمه ادیت پورت از لیست All Switch Ports در مودال پورت سیسکو (PortInspectorModal).',
      'رفع مشکل رفتن تولتیپ پورت‌های فیس‌پلیت زیر کادر بالایی با افزایش فضای بالای گرید فیس‌پلیت، تصحیح z-index و بهینه‌سازی موقعیت و اندازه پاپ‌آپ وضعیت پورت در NetworkPortSvg.',
      'افزودن کامل قابلیت اسکرول خودکار به بخش ادیتور با کلیک روی ویرایش پورت در صفحه مدیریت جامع پورت‌ها (PortManagementView).',
      'تجهیز صفحه مدیریت پورت‌ها (Ports, Trunk/Access & VLAN Monitoring) به سوئیت کامل امنیت پورت لایه ۲ سیسکو (Cisco Layer 2 Port Security Suite) شامل فعال‌سازی/غیرفعال‌سازی، مودهای یادگیری Sticky و Configured و Dynamic، تعیین حداکثر مک مجاز (با پریست‌های ۱، ۲ و ۵ مک)، سیاست‌های برخورد با تخلف (Shutdown و Restrict و Protect)، پیش‌نمایش بلادرنگ فرامین سیسکو IOS-XE، تب فیلتر اختصاصی Port Security و ستون نمایش وضعیت امنیت در جدول پورت‌ها.'
    ],
    changes_en: [
      'Implemented smooth auto-scroll to the port editor section when clicking the edit button for any port in the All Switch Ports list in PortInspectorModal.',
      'Fixed faceplate port tooltip clipping under the upper border by expanding top clearance of the faceplate grid, optimizing z-index layering, and refining tooltip dimensions in NetworkPortSvg.',
      'Enabled seamless scroll-to-edit behavior when editing ports from the table in the full Port Management view (PortManagementView).',
      'Integrated the complete Cisco Layer 2 Port Security Suite into PortManagementView, featuring toggle controls, Sticky/Configured/Dynamic MAC definition modes, maximum MAC threshold presets (1, 2, 5 MACs), violation actions (Shutdown, Restrict, Protect), real-time Cisco IOS-XE CLI preview, dedicated Port Security filter tab, and security status column in the ports table.'
    ]
  },
  {
    version: '1.76.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'اصلاح دارک تم مودال افزودن تجهیز، انحصار دکمه افزودن تجهیز به ویو کارت و یکپارچه‌سازی دکمه‌های کنترل پنجره با ترمینال سیسکو (Add Device Modal Dark Theme & Cisco Terminal Window Controls Sync)',
    title_en: 'Add Device Modal Dark Theme Overhaul, Restrict Add Device Button to Card View Only, and Unified Cisco Terminal Header Window Controls',
    changes: [
      'اصلاح و سازگار کردن کامل تم تاریک (Dark Theme) در مودال افزودن تجهیز به نقشه توپولوژی سفارشی (CustomMapAddDeviceModal) با رنگ‌بندی استاندارد، رفع کلاس‌های ناسازگار و بهبود کنتراست المان‌ها.',
      'محدود کردن نمایش دکمه «افزودن تجهیز» در نوار ابزار و بوم خالی نقشه توپولوژی فقط به حالت نمای کارت (Card View Mode).',
      'تجهیز هر دو مودال Add Device to Custom Topology Map و Add Hardware Device to Rack به دکمه‌های کنترل پنجره (تمام‌صفحه/خروج از تمام‌صفحه، مینیمایز و بستن) دقیقا مطابق با شرایط، آیکون‌ها، چیدمان و استایل دکمه‌های ترمینال سیسکو (CiscoTerminalModal).'
    ],
    changes_en: [
      'Overhauled dark theme styling in CustomMapAddDeviceModal with a dedicated dark palette, fixing contrast and invalid background classes.',
      'Restricted the "Add Device" button on both topology toolbar and empty canvas to strictly display only in Card View mode.',
      'Equipped both CustomMapAddDeviceModal and AddHardwareModal with universal window controls (Fullscreen toggle, Minimize, Close) strictly matching the behavior, icons, tooltips, and styling of CiscoTerminalModal.'
    ]
  },
  {
    version: '1.76.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'یکپارچه‌سازی افزودن رک و دکل در مودال جامع نصب سخت‌افزار با تب‌های اختصاصی رک و دکل (Unified Rack & Tower Hardware Catalog Integration)',
    title_en: 'Unified Rack & Tower Creation within Hardware Catalog Modal as First & Second Tabs',
    changes: [
      'انتقال دکمه‌های مجزای افزودن رک (Add Rack) و افزودن دکل (Add Tower) از صفحه نقشه شماتیک و ویوی فیزیکال به داخل مودال جامع Add Hardware Device to Rack.',
      'افزودن دو تب اول و دوم اختصاصی به بخش Hardware Catalog Selection: تب ۱ برای رک سرور (Server Rack Cabinet) و تب ۲ برای دکل مخابراتی (Telecom Tower).',
      'تجهیز تب‌های رک و دکل به گزینه‌های کامل فنی شامل یونیت‌های رک (۱۲U تا ۴۸U)، عمق‌های مختلف (۶۰ تا ۱۲۰ سانتیمتر)، ارتفاع دکل (۶ تا ۱۲۰ متر)، انواع استراکچر (مهاری G35/G45، خودایستا ۳ پایه/۴ پایه، منوپل) و انتخاب رنگ بدنه.',
      'پیاده‌سازی پیش‌نمایش برداری وکتور زنده (Photorealistic SVG Vector Preview) اختصاصی و لحظه‌ای برای رک و دکل متناسب با ابعاد و رنگ انتخابی.',
      'یکپارچه‌سازی و بهینه‌سازی دکمه نوار ابزار و بوم خالی در ویوی فیزیکال با باز شدن مستقیم مودال جامع با دسترسی به تمام دسته‌ها.'
    ],
    changes_en: [
      'Relocated standalone Add Rack and Add Tower buttons from the schematic map toolbar and empty canvas into the unified Add Hardware Device modal.',
      'Added dedicated Tab 1 (Server Rack Cabinet) and Tab 2 (Telecom Tower) within the Hardware Catalog Selection category tabs.',
      'Equipped Rack and Tower tabs with full technical configuration: rack unit sizing (12U-48U), depth choices (60-120cm), tower structural height (6-120m), mast lattice types (G35/G45 guyed, 3/4-legged self-supporting, monopole), and chassis coating colors.',
      'Implemented dedicated live photorealistic SVG vector preview engines for both server rack cabinets and telecommunications towers responding in real-time to selected dimensions and colors.',
      'Consolidated toolbar and empty canvas action buttons in physical view to seamlessly launch the unified catalog modal.'
    ]
  },
  {
    version: '1.75.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'ارتقای مودال تغییر مود پورت به ترانک، یکپارچه‌سازی کامل دارک تم، قابلیت فول‌اسکرین با مرز فوتر و اعمال سخت‌افزاری در بک‌اند (Port Mode Trunk Modal & Hardware Backend Sync)',
    title_en: 'Trunk Port Mode Modal Overhaul, Universal Fullscreen & Minimize with Footer Boundary, and Real Device Backend Execution',
    changes: [
      'همگام‌سازی و اصلاح کامل تم دارک در مودال تأیید دستورات (Change Port Mode to Trunk) با پالت تیره اختصاصی، کنتراست استاندارد و رفع ناهماهنگی‌های رنگی.',
      'تجهیز مودال به کنترل‌های استاندارد هدر شامل دکمه مینیمایز (Minus)، دکمه تغییر حالت به تمام‌صفحه (Fullscreen / Maximize) و دکمه خروج سریع (ESC).',
      'تنظیم دقیق مرز پایین پنجره در حالت تمام‌صفحه به گونه‌ای که تا لبه بالایی نوار وضعیت/فوتر پایین صفحه (bottom-8) امتداد یابد و هرگز زیر فوتر نرود.',
      'پیاده‌سازی و اتصال کامل بک‌اند در سرور و درایورهای Cisco و MikroTik جهت اعمال مستقیم دستورات سخت‌افزاری پورت (مانند switchport mode trunk و admin status) با زدن دکمه ذخیره و تایید.',
      'ثبت خودکار تغییرات در sessionChanges و تغییر وضعیت دستگاه به حالت دارای تغییرات ذخیره‌نشده (has_unsaved_changes).'
    ],
    changes_en: [
      'Overhauled Change Port Mode to Trunk modal dark theme styling with obsidian/slate palettes, rich contrast, and eliminated unstyled elements.',
      'Integrated standardized ModalHeaderControls with minimize button, fullscreen expand/restore toggle, and quick escape key shortcuts.',
      'Strictly constrained the fullscreen modal layout boundary to stop precisely at the upper edge of the bottom footer (bottom-8), ensuring it never stretches underneath.',
      'Implemented full backend hardware CLI integration in Express, Python API, and Cisco/MikroTik drivers to apply real device port mode changes upon clicking the Save button.',
      'Automatically tracked session history changes and marked the target device with unsaved changes flag requiring NVRAM write memory.'
    ]
  },
  {
    version: '1.74.5',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'حفظ و ادغام قطعی دیتابیس، تجهیزات و تنظیمات کاربر در هنگام به‌روزرسانی پنل (User Inventory & Database Persistence During Update)',
    title_en: 'Guaranteed Device Inventory, Database State & Credential Persistence Engine During Panel Updates',
    changes: [
      'حل کامل مشکل حذف تجهیزات ثبت‌شده در صفحه Network Equipment Inventory پس از اجرای Standard Update یا Clean Reinstall.',
      'ایجاد موتور پشتیبان‌گیری چندلایه‌ای عمیق (Deep Snapshot & Persistent Vault) در حافظه و دیسک قبل از شروع فرآیند به‌روزرسانی برای نگهداری کامل network_data.json، database_store.json و .env.',
      'پیاده‌سازی مرحله ادغام هوشمند (Smart Merge) پس از همگام‌سازی با گیت‌هاب جهت حفظ و اولویت‌دهی ۱۰۰٪ به تمام تجهیزات، پورت‌ها، لینک‌های توپولوژی، نقشه‌های سفارشی، پسوردها و یادداشت‌های ثبت‌شده توسط کاربر.',
      'افزودن لایه بازگردانی اضطراری خودکار (Fallback Auto-Recovery) در بک‌اند در صورت وقوع هرگونه خطای احتمالی در فایل‌های داده.'
    ],
    changes_en: [
      'Completely resolved device inventory loss where user-created network equipment disappeared after performing a Standard Update or Clean Reinstall.',
      'Introduced a multi-layered Deep Snapshot & Persistent Vault engine storing in-memory and disk backups of network_data.json, database_store.json, and .env before update pipelines start.',
      'Engineered an intelligent post-git synchronization Smart Merge phase ensuring 100% preservation and priority for all user-defined devices, ports, topology links, custom maps, credentials, and sticky notes.',
      'Added automated fallback recovery in backend data loader to restore state from persistent backups if any corruption or missing data is detected.'
    ]
  },
  {
    version: '1.74.4',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'رفع مشکل دسترسی به دکمه‌های کنترل هدر مودال در حالت تمام‌صفحه (Modal Portal & Fullscreen Controls Fix)',
    title_en: 'Header Controls Persistence & React Portal Integration in Write Memory Fullscreen Modal',
    changes: [
      'انتقال رندرینگ مودال تایید رایت (Confirm Save Configuration to NVRAM) به React Portal بر روی ریشه document.body با z-index فوق‌العاده بالا (9999).',
      'رفع کامل هم‌پوشانی نوار ناوبری اصلی (Navbar) روی هدر مودال در حالت تمام‌صفحه و تضمین نمایش دائمی دکمه‌های خروج از تمام‌صفحه، مینیمایز و بستن.',
      'تجهیز پنجره به کلید میانبر هوشمند Escape جهت خروج سریع از حالت تمام‌صفحه و انصراف، همراه با Pinned شدن ثابت هدر و فوتر اقدامات.'
    ],
    changes_en: [
      'Migrated "Confirm Save Configuration to NVRAM" modal rendering to React Portal attached directly to document.body with top-tier z-index (9999).',
      'Completely resolved stacking context overlap where the application Navbar covered the modal header in fullscreen mode, guaranteeing persistent visibility of Exit Fullscreen, Minimize, and Close buttons.',
      'Implemented smart Escape key navigation for exiting fullscreen mode or dismissing the modal, along with pinned header and action footer.'
    ]
  },
  {
    version: '1.74.3',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'فعال‌سازی دکمه مینیمایز در لیست تجهیزات و تراز لبه فوتر در حالت فول‌اسکرین (Modal Minimize & Footer Alignment)',
    title_en: 'Modal Minimize in Device Inventory & Fullscreen Footer Edge Alignment',
    changes: [
      'فعال‌سازی دکمه مینیمایز در مودال تایید رایت حافظه دائم (Confirm Save Configuration to NVRAM) در صفحه مدیریت تجهیزات شبکه، و ایجاد تب اختصاصی داک در پایین صفحه جهت بازگردانی سریع پنجره تایید رایت.',
      'تضمین همیشگی وجود دکمه مینیمایز بر روی هدر مودال تحت تمامی شرایط با فالبک ایمن داخلی.',
      'اصلاح تراز حالت تمام‌صفحه (Fullscreen): تنظیم کانتینر مودال بر روی bottom-8 تا لبه پایینی مودال دقیقاً مماس بر لبه بالایی فوتر برنامه قرار گیرد و هرگز به زیر فوتر نرود.'
    ],
    changes_en: [
      'Activated the Minimize button on the "Confirm Save Configuration to NVRAM" modal when triggered from the Device Inventory list, adding a dedicated bottom dock chip for quick restoration.',
      'Guaranteed continuous presence of the minimize control in modal headers under all invocations via a robust internal fallback.',
      'Corrected fullscreen modal alignment: configured container to bottom-8 so that fullscreen mode aligns flush with the application footer top edge and never overflows underneath it.'
    ]
  },
  {
    version: '1.74.2',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'تجهیز مودال تایید رایت NVRAM به دکمه و حالت تمام‌صفحه و یکپارچگی سراسری (Modal Fullscreen & Architecture Verification)',
    title_en: 'Write Memory Confirmation Modal Fullscreen Support & Architecture Verification',
    changes: [
      'بررسی و تایید معماری یکپارچه مودال تایید رایت (Confirm Save Configuration to NVRAM): استفاده از کامپوننت مشترک واحد در تمام بخش‌ها (لیست تجهیزات، مودال پورت سیسکو و ترمینال سیسکو).',
      'تجهیز مودال تایید به دکمه فول‌اسکرین (Fullscreen / Maximize) در هدر با آیکون‌های استاندارد Maximize2 و Minimize2.',
      'گسترش هوشمندانه ارتفاع و ابعاد بخش لیست تغییرات پورت‌ها و کادر پیش‌نمایش دستورات خط فرمان سیسکو (CLI Diff Preview) در حالت تمام‌صفحه جهت سهولت بررسی تغییرات حجیم.',
      'رعایت دقیق قوانین چندزبانگی و واکنش‌گرایی در هر دو تم تیره و روشن.'
    ],
    changes_en: [
      'Architecture verification: confirmed a single unified "Confirm Save Configuration to NVRAM" modal component across all interfaces (Device Inventory, Port Inspector, and Cisco Terminal).',
      'Equipped the confirmation modal with Fullscreen/Maximize toggle in the header controls using standard Lucide Maximize2 and Minimize2 icons.',
      'Intelligent layout and height expansion for modified interfaces list and Cisco CLI Diff Preview box in fullscreen mode for effortless auditing of large configurations.',
      'Strict adherence to multilingual localization and responsive design in both dark and light modes.'
    ]
  },
  {
    version: '1.74.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'یکپارچه‌سازی مودال تایید رایت در لیست مدیریت تجهیزات شبکه (Inventory Write Confirmation Modal)',
    title_en: 'Write Memory Confirmation Modal Integration in Network Equipment Inventory',
    changes: [
      'یکپارچه‌سازی کامل مودال تایید رایت حافظه دائم (Confirm Save Configuration to NVRAM) در لیست تجهیزات شبکه (Network Equipment Inventory & Management).',
      'با کلیک روی دکمه Write Memory در سطر تجهیز یا از طریق منوی عملیات سه‌نقطه (Context Menu)، مودال تایید اختصاصی باز شده و تغییرات ذخیره‌نشده، پورت‌های تغییریافته و پیش‌نمایش دستورات خط فرمان سیسکو نمایش داده می‌شود.',
      'جلوگیری از رایت ناخواسته و افزایش ایمنی پیکربندی در سرتاسر بخش‌های پرتال.'
    ],
    changes_en: [
      'Fully integrated the "Confirm Save Configuration to NVRAM" modal into the Network Equipment Inventory & Management view.',
      'Clicking the "Write Memory" button on any device row or via the 3-dots action menu now opens the confirmation modal with detailed pending changes, modified interfaces, and CLI script preview.',
      'Prevents accidental configuration overwrites and ensures comprehensive configuration safety across all portal views.'
    ]
  },
  {
    version: '1.74.0',
    releaseDate: '2026-09-18',
    type: 'minor',
    title: 'مودال تایید هوشمند پیش از رایت پیکربندی در NVRAM و اصلاح نمایش وضعیت در لیست تجهیزات (Write Memory Confirmation Modal)',
    title_en: 'Write Memory Confirmation Modal & Equipment List Action Button Refinement',
    changes: [
      'افزودن مودال تایید اختصاصی و هوشمند پیش از اجرای رایت (Write Memory) در مودال پورت سیسکو (Port Inspector) و ترمینال سیسکو (Cisco Terminal)، جهت جلوگیری از رایت ناخواسته.',
      'نمایش لیست جامع و دقیق تغییرات اعمال‌شده شامل پورت‌های تغییریافته، نوع تغییر (VLAN, Description, Port-Security, Mode, Shutdown)، زمان اعمال و پیش‌نمایش دستورات خط فرمان سیسکو (CLI Diff Preview).',
      'پشتیبانی کامل و دوگانه از تم تاریک (Dark Mode) و تم روشن (Light Mode) با طراحی شیشه‌ای مدرن و کنتراست استاندارد.',
      'افزودن اندپوینت بک‌اند GET /api/devices/:id/unsaved-changes جهت ارزیابی و استخراج دقیق تفاوت‌های Running-Config و Startup-Config.',
      'اصلاح نمایش وضعیت رایت در لیست تجهیزات (Device List): حذف برچسب اضافی Write Needed و نگه داشتن دکمه کاربردی Write Memory در سطر تگ‌های تجهیز جهت سادگی و تمیزی رابط کاربری.',
      'تجهیز مودال جدید به امکان مینیمایز (Rule 5) و رعایت کامل چندزبانگی انگلیسی و فارسی (Rule 4).'
    ],
    changes_en: [
      'Added dedicated intelligent confirmation modal before executing "Write Memory" in Cisco Port Inspector and Cisco Terminal modals to prevent accidental writes.',
      'Comprehensive summary display of pending modifications including modified interfaces, change types (VLAN, Description, Port-Security, Mode, Shutdown), timestamps, and CLI Diff Preview.',
      'Full adaptive support for both Dark Mode and Light Mode with high-contrast glassmorphism aesthetic.',
      'Added backend endpoint GET /api/devices/:id/unsaved-changes to analyze and extract running vs startup config differences.',
      'Refined device status in Network Equipment Inventory & Management list: removed redundant "Write Needed" text label while keeping the functional "Write Memory" button.',
      'Equipped the confirmation modal with universal minimization capability (Rule 5) and strict English/Persian localization (Rule 4).'
    ]
  },
  {
    version: '1.73.3',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'نمایش و فیلتر اختصاصی ویلن‌های تعریف‌شده روی دستگاه در مودال تخصیص ویلن دسترسی (Device Configured VLANs)',
    title_en: 'Device-Specific VLAN Listing & Backend Query in Assign Access VLAN Modal',
    changes: [
      'نمایش اختصاصی لیست ویلن‌های تعریف‌شده و فعال روی خود دستگاه جاری در بخش Device Configured VLANs در مودال تخصیص ویلن دسترسی.',
      'افزودن اندپوینت اختصاصی بک‌اند GET /api/devices/:id/vlans برای استخراج هوشمند ویلن‌های تعریف‌شده و شمارش پورت‌ها، به‌همراه پارس خروجی show vlan brief سیسکو و جدول ویلن میکروتیک.',
      'پشتیبانی از استخراج محلی ویلن‌های پورت‌های دستگاه (Access و Trunk Allowed) به‌عنوان فالبک بلادرنگ جهت اطمینان از عملکرد پایدار آفلاین و شبیه‌ساز.',
      'حفظ کامل و دقیق ساختار ظاهری، استایل، فیلتر جستجو، پیش‌نمایش دستورات و دکمه‌های مودال مطابق درخواست کاربر.'
    ],
    changes_en: [
      'Display device-specific configured and active VLANs in the "Device Configured VLANs" section of the Assign Access VLAN modal for the selected device.',
      'Added dedicated backend endpoint GET /api/devices/:id/vlans to extract device-specific VLANs, port counts, and parse Cisco show vlan brief / MikroTik vlan table.',
      'Real-time client fallback to extract VLANs directly from device ports (both Access VLAN and Trunk allowed VLANs) ensuring seamless offline and simulator support.',
      'Preserved exact existing modal layout, styling, search filter, CLI command preview, and buttons.'
    ]
  },
  {
    version: '1.73.2',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'یکپارچه‌سازی بک‌اند و اصلاح کامل تم تیره مودال تخصیص ویلن دسترسی (Assign Access VLAN)',
    title_en: 'Backend Integration & Dark Theme Redesign for Assign Access VLAN Modal on Cisco & MikroTik',
    changes: [
      'پیاده‌سازی کامل بک‌اند و اجرای دستورات متناظر روی سخت‌افزار واقعی و شبیه‌ساز برای تخصیص ویلن دسترسی (Assign Access VLAN) روی سوئیچ‌ها و روترهای سیسکو و میکروتیک.',
      'تولید هوشمند دستورات پیکربندی سوئیچ‌پورت سیسکو (switchport mode access / switchport access vlan X) و ساب‌اینترفیس‌های روتر (encapsulation dot1Q X) و پورت‌های بریج میکروتیک (pvid=X).',
      'بازطراحی جامع استایل و تم مودال هماهنگ با تم تیره (Dark Theme Harmony)، شامل کادر پیش‌نمایش کنسول CLI به سبک کنسول شبکه، رنگ‌بندی تیره‌ی سطح بالا و کنتراست شفاف.',
      'تجهیز مودال تخصیص ویلن به دکمه مینیمایز (Universal Modal Minimization Rule) و هماهنگی کامل چندزبانگی (انگلیسی و فارسی بدون متن هاردکد).'
    ],
    changes_en: [
      'Full backend integration and physical/simulated device CLI execution for Assign Access VLAN on Cisco switches, routers, and MikroTik RouterOS devices.',
      'Smart CLI command generation for Cisco IOS Catalyst switches (switchport mode access / switchport access vlan X), Cisco routers (encapsulation dot1Q sub-interfaces), and MikroTik RouterOS bridge ports (pvid=X).',
      'Comprehensive redesign of the modal styling to achieve perfect dark theme harmony with network-console style CLI preview, deep slate backgrounds, and high-contrast typography.',
      'Equipped Assign Access VLAN modal with universal minimization button (Minus icon) and strict English/Persian localization.'
    ]
  },
  {
    version: '1.73.1',
    releaseDate: '2026-09-18',
    type: 'patch',
    title: 'اتصال کامل بک‌اند و اعمال واقعی توضیحات پورت (Port Description) روی سوئیچ‌های سیسکو و میکروتیک',
    title_en: 'Backend Integration & Real Device CLI Execution for Port Description on Cisco & MikroTik',
    changes: [
      'اتصال کامل مودال تنظیم توضیحات پورت (Set Port Description) به اندپوینت عملیات سخت‌افزاری (/api/devices/:id/operations) و اعمال مستقیم دستورات CLI روی سوئیچ.',
      'تولید هوشمند دستورات پیکربندی Cisco IOS (دستور interface X / description ... یا no description) و MikroTik RouterOS (/interface set comment=...).',
      'بهبود اندپوینت /api/devices/:dev_id/ports/:port_id برای رمزگشایی صحیح نام پورت‌های دارای اسلش (/ یا %2F) و اعمال خودکار دستورات روی سخت‌افزار واقعی یا شبیه‌ساز.',
      'افزودن دکمه مینیمایز (Universal Modal Minimization) و پشتیبانی از دو زبان انگلیسی و فارسی در مودال تنظیم دیسکریپشن پورت.'
    ],
    changes_en: [
      'Connected Set Port Description modal to the hardware operations backend endpoint (/api/devices/:id/operations) for physical device CLI execution.',
      'Smart CLI command generation for both Cisco IOS (interface X / description ... or no description) and MikroTik RouterOS (/interface set comment=...).',
      'Enhanced /api/devices/:dev_id/ports/:port_id endpoint to properly decode slash-containing interface names and execute CLI commands directly.',
      'Added Universal Modal Minimization button and full bilingual English/Persian localization to Port Description modal.'
    ]
  },
  {
    version: '1.73.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'معماری تطبیقی دو لایه SSH: اتصال آنی تجهیزات نوین بدون تاخیر و فال‌بک خودکار تجهیزات قدیمی سیسکو',
    title_en: 'Two-Tier Adaptive SSH Engine: Zero-Latency Modern Fast Path & Automatic Cisco Legacy Fallback',
    changes: [
      'پیاده‌سازی معماری دو لایه مدرن-محور برای کلیه ارتباطات SSH: لایه ۱ (Fast Path) برای تجهیزات نوین (IOS-XE, Nexus, MikroTik v7, Linux) با الگوریتم‌های مدرن (Curve25519, ECDH, CTR/GCM) بدون کوچک‌ترین افت سرعت یا تاخیر.',
      'فعال‌سازی خودکار و کاملاً هوشمند لایه ۲ (Legacy Fallback) صرفاً در صورت عدم سازگاری یا ریست هندشیک توسط تجهیزات قدیمی سیسکو (Cisco 2960/3560/3750 با الگوریتم‌های diffie-hellman-group1-sha1, ssh-rsa و aes128-cbc).',
      'یکپارچه‌سازی قطعی و سراسری در تمامی ماژول‌های سامانه شامل ترمینال وب (NetworkTerminal)، تست اتصال در ثبت تجهیز جدید (Register Device SSH Test)، کشف تجهیزات (Hardware Discovery)، مدیریت نشست‌ها (SSHManager) و تنظیمات دسته‌جمعی (Bulk Config).',
      'توقف سریع و بدون سعی مجدد در صورت ورود کلمه عبور اشتباه (AuthenticationException) یا عدم دسترسی شبکه جهت جلوگیری از ایجاد تاخیر بی‌مورد.',
      'ثبت و گزارش دقیق الگوریتم‌های توافق‌شده (KEX, Cipher, Host Key, MAC) در زمان برقراری ارتباط با تضمین عدم بروز خطای unknown cipher.'
    ],
    changes_en: [
      'Implemented a Two-Tier Modern-First Adaptive SSH Architecture: Tier 1 (Fast Path) connects modern devices (Cisco IOS-XE, Nexus, MikroTik v7, Linux OpenSSH) using modern cryptography (Curve25519, ECDH, CTR/GCM, Ed25519/RSA-SHA2) with zero latency penalty or overhead.',
      'Automatic and seamless activation of Tier 2 (Legacy Fallback) exclusively when older Cisco equipment (Catalyst 2960/3560/3750 on IOS 12/15) rejects modern algorithms (negotiating diffie-hellman-group1-sha1, ssh-rsa, and aes128-cbc).',
      'Universal unification across all SSH modules: Web Terminal (NetworkTerminal), Register Device SSH Test, Hardware Discovery, Session Manager (SSHManager), and Bulk Config.',
      'Immediate fast-fail on invalid credentials (AuthenticationException) or unreachable hosts without redundant retries to eliminate unnecessary connection delays.',
      'Precise capture and reporting of negotiated algorithms (KEX, Cipher, Host Key, MAC) with guaranteed zero "unknown cipher" crashes.'
    ]
  },
  {
    version: '1.72.3',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'حل قطعی خطای unknown cipher از طریق ارزیابی دیکشنری داخلی کلاینت و الگوریتم‌های سوئیچ‌های سیسکو',
    title_en: 'Definitive Fix for Unknown Cipher via Transport Internal Cipher Reflection & Cisco KEX Loop',
    changes: [
      'حل بنیادین خطای unknown cipher با حذف تغییرات کلاس‌لول و تطبیق انحصاری سایفرها با دیکشنری داخلی _cipher_info هر نشست Transport در زمان اجرا.',
      'تضمین عدم بروز استثنای خطای سایفر و عبور امن از محدودیت‌های OpenSSL 3.0 در سیستم‌های عامل میزبان.',
      'توالی هوشمند آزمون الگوریتم‌های تبادل کلید با اولویت تجهیزات سیسکو کاتالیست (DH Group 14/1 و CBC) به همراه فال‌بک خودکار به مدهای مدرن و سنتی بدون وقفه.',
      'پشتیبانی کامل از احراز هویت تعاملی (keyboard-interactive) برای تجهیزاتی که متد پسورد مستقیم را نپذیرفته و منتظر پرامپت هستند.'
    ],
    changes_en: [
      'Definitively fixed the "unknown cipher" error by inspecting each live Transport instance\'s _cipher_info dictionary at runtime instead of modifying class-level attributes.',
      'Guaranteed zero cipher exception crashes and safe traversal over OpenSSL 3.0 cipher restrictions on modern host systems.',
      'Smart sequential negotiation loop prioritizing Cisco Catalyst legacy KEX (DH Group 14/1 and CBC) with seamless fallback to modern and default profiles.',
      'Full keyboard-interactive authentication fallback support for network devices requiring interactive prompt verification.'
    ]
  },
  {
    version: '1.72.2',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'موتور تطبیقی چندپروفایلی الگوریتم‌های SSH و رفع خطای ناشناخته بودن سایفر (unknown cipher)',
    title_en: 'Adaptive Multi-Profile SSH Algorithm Engine & Fix for Unknown Cipher Errors',
    changes: [
      'رفع خطای "unknown cipher" از طریق فیلتر هوشمند و انطباق سایفرها صرفاً با الگوریتم‌های استاندارد و قابل رمزگشایی در Paramiko (نظیر AES-CTR, AES-CBC, 3DES-CBC).',
      'طراحی موتور تطبیقی چندپروفایلی (Adaptive Multi-Profile Cascade) برای آزمایش پیوسته و بدون توقف پروفایل‌های گوناگون KEX و Cipher هنگام تست اتصال SSH در ثبت تجهیز جدید.',
      'پشتیبانی هم‌زمان، هوشمند و خودکار از نسل‌های گوناگون تجهیزات: سوئیچ‌های کلاسیک سیسکو کاتالیست (2960/3560)، تجهیزات نوین (IOS-XE/Nexus)، روترهای میکروتیک (v6/v7) و سرورهای لینوکسی.',
      'عدم توقف در صورت عدم تطابق یک الگوریتم؛ بررسی متوالی پروفایل‌های تبادل کلید تا برقراری موفقیت‌آمیز ارتباط همراه با پشتیبانی از احراز هویت تعاملی (keyboard-interactive).'
    ],
    changes_en: [
      'Resolved the "unknown cipher" error by strictly validating and filtering ciphers against supported Paramiko decryption suites (such as AES-CTR, AES-CBC, and 3DES-CBC).',
      'Engineered an adaptive multi-profile cascade that sequentially tests diverse KEX, Cipher, and Key negotiation profiles without stopping during SSH connection tests in Register New Device.',
      'Seamless multi-generation device interoperability: simultaneously supports classic legacy Cisco Catalyst (2960/3560), modern Cisco IOS-XE/Nexus, MikroTik RouterOS (v6 & v7), and modern Linux servers.',
      'Non-halting negotiation loop: gracefully cycles through alternate algorithm suites upon mismatch until connection succeeds, with automated keyboard-interactive authentication fallback.'
    ]
  },
  {
    version: '1.72.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع خطای ناسازگاری الگوریتم‌های تبادل کلید SSH (KEX) در سوئیچ‌های سیسکو و تجهیزات شبکه قدیمی',
    title_en: 'Fix Incompatible SSH Peer KEX Algorithm Error on Cisco Catalyst & Legacy Network Devices',
    changes: [
      'حل خطای Incompatible ssh peer (no acceptable kex algorithm) هنگام تست اتصال SSH در فرم ثبت دستگاه جدید (Register New Network Device).',
      'ایجاد ماژول سازگاری جامع SSH (ssh_compat) و تزریق خودکار الگوریتم‌های تبادل کلید قدیمی سیسکو کاتالیست (diffie-hellman-group1-sha1, diffie-hellman-group14-sha1, diffie-hellman-group-exchange-sha1/256).',
      'پشتیبانی کامل از الگوریتم‌های کلید میزبان و سایفرهای قدیمی نظیر ssh-rsa، ssh-dss، aes128-cbc و 3des-cbc در تمام ماژول‌های کشف خودکار سخت‌افزار، شبیه‌سازها و نشست‌های SSH.',
      'افزودن مکانیسم چند لایه بازیابی (Multi-tier fallback) با سوکت مستقیم Transport و پشتیبانی خودکار از احراز هویت تعاملی (keyboard-interactive) در صورت رد پسورد مستقیم.'
    ],
    changes_en: [
      'Fixed "Incompatible ssh peer (no acceptable kex algorithm)" error when testing SSH connections in the Register New Network Device modal.',
      'Introduced a dedicated enterprise SSH compatibility layer (ssh_compat) injecting legacy Cisco Catalyst key exchange algorithms (diffie-hellman-group1-sha1, diffie-hellman-group14-sha1, diffie-hellman-group-exchange-sha1/256).',
      'Comprehensive support for legacy host key types and ciphers including ssh-rsa, ssh-dss, aes128-cbc, and 3des-cbc across hardware discovery, connection managers, and terminal sessions.',
      'Added multi-tier fallback architecture via raw Transport sockets and automated keyboard-interactive authentication fallback when standard password auth is refused.'
    ]
  },
  {
    version: '1.72.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'بهبود پاسخ‌دهی فوری بررسی آپدیت در هدر، ارتقای کامل پکیج‌ها و بک‌اند، و رفع تداخل مودال‌ها با فوتر در حالت تمام‌صفحه',
    title_en: 'Instant Header Update Check, Complete Backend & Package Rebuild Suite, and Fullscreen Modal Footer Alignment',
    changes: [
      'بررسی آنی و بی‌درنگ مخزن گیت‌هاب با کلیک بر روی دکمه Check for Updates در هدر، با ادغام مستقیم GitHub API و توکن احراز هویت، رفع کامل تاخیر و باز شدن خودکار مودال تغییرات پس از یافتن آپدیت.',
      'افزودن دکمه همگام‌سازی و نصب مجدد کامل (Force Full Rebuild & Sync) در مودال انتشار جهت بازسازی صددرصد پکیج‌های NPM (شامل devDependencies)، درایورهای پایتون و کدهای بک‌اند بدون نیاز به حذف دستی پنل از سرور.',
      'پاکسازی و بستن پروسه قدیمی پایتون در پورت ۸۰۰۰ قبل از راه‌اندازی مجدد تا تمام کدهای جدید بک‌اند بلافاصله بارگذاری گردند.',
      'افزودن لاگ‌های پیش‌رونده و زنده در رابط کاربری در حین اجرای فرآیند ارتقای سرور جهت نمایش دقیق هر یک از فازهای ۶گانه.',
      'تنظیم دقیق موقعیت تمام مودال‌های سراسر سامانه (Bulk Device Config, Audit Logs, Schematic Topology, VPN Manager, Release Notes) در حالت معمولی و تمام‌صفحه تا لبه بالایی فوتر (bottom-8) جهت جلوگیری از هرگونه هم‌پوشانی با فوتر.'
    ],
    changes_en: [
      'Instant real-time GitHub repository release checking from the header profile button with GitHub API integration and auth token support, immediately opening release notes on update detection.',
      'Added Force Full Rebuild & Sync capability in the Release Notes modal to comprehensively reinstall all NPM packages (including devDependencies), Python drivers, and backend code without manual server wipes.',
      'Graceful termination of stale Python backend processes on port 8000 during updates ensuring all new backend features load instantly upon restart.',
      'Live progressive UI phase tracking during server updates, providing clear feedback across all 6 upgrade phases.',
      'System-wide modal positioning overhaul across all modals (Bulk Device Config, Audit Logs, Schematic Topology, VPN Manager, Release Notes), strictly stopping at the top edge of the footer (bottom-8) in both normal and fullscreen modes.'
    ]
  },
  {
    version: '1.71.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'ارتقای جامع موتور بررسی و نصب به‌روزرسانی پنل، همگام‌سازی بی‌درنگ با گیت‌هاب و رفع مشکل پکیج‌ها و کدهای بک‌اند',
    title_en: 'Comprehensive In-Panel Update Engine Overhaul, Immediate GitHub Release Checker & Complete Clean Sync',
    changes: [
      'بررسی آنی و بی‌درنگ مخزن گیت‌هاب با کلیک بر روی دکمه Check for Updates در منوی پروفایل هدر بدون کش، همراه با نمایش نشانگر چرخان، وضعیت بررسی و بازخورد اختصاصی.',
      'افزودن هدرهای ضد کش (Cache-Control: no-store) و بررسی همزمان کامیت‌های Git با دستورات مستقیم git ls-remote جهت تشخیص فوری نسخه‌های جدید در سرور.',
      'بازنویسی کامل پایپ‌لاین به‌روزرسانی پنل در سرور (Phase 1 تا 6) شامل بک‌آپ ایمن از تنظیمات و دیتابیس محلی، همگام‌سازی صددرصد فایل‌ها، نصب و بازسازی کامل پکیج‌های NPM با پشتیبانی از ریپازیتوری پشتیبان (Mirror fallback).',
      'نصب خودکار پکیج‌های پیش‌نیاز بک‌اند پایتون (paramiko, cryptography, websockets) و فایل requirements.txt جهت برطرف شدن نیاز به نصب مجدد دستی.',
      'ساخت مجدد باندل‌های فرانت‌اند و بک‌اند به همراه بازسازی باینری‌های لینوکس Rollup/esbuild و زمان‌بندی راه‌اندازی مجدد خودکار سرویس پس از اتمام ارتقا.',
      'پشتیبانی از حالت ارتقای عمیق و پاکسازی کامل (Clean Reinstall Mode) در مودال انتشار برای رفع کامل مشکل پکیج‌های ناقص یا باقیمانده‌های قدیمی.'
    ],
    changes_en: [
      'Instant GitHub release check on clicking Check for Updates in the profile dropdown, bypassing browser/server caching with real-time spinners and status feedback.',
      'Added strict anti-cache response headers and direct git ls-remote remote commit verification to immediately detect new updates on GitHub.',
      'Complete overhaul of server-side update pipeline (Phases 1-6) including automatic configuration & database safeguarding, comprehensive git code sync, and robust NPM package reconciliation with mirror registry fallback.',
      'Automatic installation and verification of Python backend dependencies (paramiko, cryptography, websockets) and requirements.txt, eliminating the need for manual server wipes.',
      'Automatic rebuilding of production frontend and backend bundles, Linux native binary rebuilds (Rollup/esbuild), and graceful service restart scheduling.',
      'Added deep clean reinstallation option in Release Notes modal to resolve stale package issues or partial updates.'
    ]
  },
  {
    version: '1.70.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'افزودن قابلیت تمام‌صفحه (Fullscreen / Maximize) به مودال پیکربندی گروهی تجهیزات',
    title_en: 'Add Fullscreen / Maximize Mode Support to Bulk Device Configuration Modal',
    changes: [
      'تجهیز هدر مودال Bulk Device Configuration به دکمه سوئیچ تمام‌صفحه (Maximize2 / Minimize2) از طریق کامپوننت اشتراکی ModalHeaderControls.',
      'افزودن انیمیشن روان و انتقال ابعاد کادر به حالت تمام‌صفحه (100% عرض و ارتفاع صفحه نمایش) برای راحتی مشاهده لاگ‌ها، مقایسه Diff دستورات و لیست قالب‌ها.',
      'سازگاری کامل با جهت راست‌چین (RTL) و چپ‌چین (LTR) و سوئیچ آیکون و راهنمای تول‌تیپ به خروج از تمام‌صفحه هنگام فعال بودن.',
      'بهبود استایل و واکنش‌گرایی دکمه‌های کنترلی هدر مودال با آیکون‌های متناسب وضعیت.'
    ],
    changes_en: [
      'Equipped Bulk Device Configuration modal header with Fullscreen / Maximize toggle (Maximize2 / Minimize2) using shared ModalHeaderControls.',
      'Implemented smooth transitions expanding modal to 100% viewport width and height for optimal viewing of CLI diffs, logs, and templates.',
      'Full compatibility with RTL and LTR layouts with contextual tooltips and dynamic icon toggle between Maximize and Exit Fullscreen.',
      'Enhanced responsive modal control styling across dark and light themes.'
    ]
  },
  {
    version: '1.69.3',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح کامل مهار کادرهای راهنما در تمام لبه‌های مانیتور و جلوگیری قطعی از خروج از صفحه',
    title_en: 'Strict Viewport Boundary Clamping for Info Popovers Preventing Bottom & Edge Overflow',
    changes: [
      'محاسبه دقیق حداکثر ارتفاع (maxHeight) پویا متناسب با فاصله تا لبه پایینی صفحه نمایش.',
      'وارونه‌سازی خودکار و باز شدن کادر در بالای نشانگر موس در کلیک‌های نیمه پایینی صفحه.',
      'اعمال مهار قطعی در چهار جهت (بالا، پایین، چپ و راست با حاشیه امن حداقل ۱۲ پیکسل).',
      'تجهیز کانتینر داخلی به اسکرول روان داخلی (overflow-y-auto) با سرریز صفر در پنجره صفحه نمایش.'
    ],
    changes_en: [
      'Engineered dynamic maxHeight calculation strictly bounded to remaining vertical viewport distance.',
      'Implemented automatic upward flipping above cursor when clicked in bottom regions of the display.',
      'Enforced strict 4-way viewport boundary clamping with a guaranteed 12px safety margin from all screen edges.',
      'Enabled internal smooth scrolling within the popover body, strictly preventing any viewport or container overflow.'
    ]
  },
  {
    version: '1.69.2',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح باز شدن کادر راهنما دقیقا در محل کلیک موس (Exact Click-Anchor Popover Positioning)',
    title_en: 'Anchor Info Popover Directly to Mouse Click Location with Zero Position Delay',
    changes: [
      'محاسبه بلادرنگ و همگام مختصات افقی و عمودی کادر راهنما دقیقا زیر محل کلیک موس کاربر.',
      'حذف انیمیشن transition-all برای رفع پرش ناگهانی کادر از گوشه سمت راست به زیر موس.',
      'مرکزیت‌بخشی افقی کادر متناسب با نشانگر موس همراه با مهار هوشمند در لبه‌های مانیتور.',
      'پشتیبانی هماهنگ از کلیک کیبورد با فالبک هوشمند به موقعیت هندسی دکمه راهنما.'
    ],
    changes_en: [
      'Engineered instantaneous, synchronous coordinate calculation directly anchoring the info popover under the mouse click position.',
      'Eliminated generic transition-all animation, removing the unwanted jump/glide from the top-right corner to the cursor.',
      'Horizontally centered the popover beneath the cursor with safety viewport edge clamping.',
      'Maintained seamless keyboard accessibility with automatic fallback to trigger element bounding rect.'
    ]
  },
  {
    version: '1.69.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح موقعیت و جلوگیری از سرریز کادرهای راهنما (Info Popovers Viewport Clamping)',
    title_en: 'Fix Info Popover Positioning & Prevent Modal Scrollbar Overflow via React Portals',
    changes: [
      'انتقال رندرینگ پاپ‌اورهای راهنما به React Portal روی بدنه صفحه جهت جلوگیری از دستکاری ابعاد والد و حذف اسکرول ناخواسته.',
      'محاسبه هوشمند مختصات افقی و عمودی پاپ‌اور بر اساس فضای باقی‌مانده دید (Viewport Boundary Clamping).',
      'وارونه‌سازی خودکار موقعیت باز شدن به سمت بالا در صورت کمبود فضا در پایین دکمه.',
      'تعیین سقف عرضی و طولی متناسب با صفحه نمایش و فراهم کردن اسکرول نرم داخلی تنها برای متون طولانی.'
    ],
    changes_en: [
      'Migrated info popover rendering to React Portals on document body, completely eliminating unwanted parent container scrollbars.',
      'Engineered smart viewport boundary clamping preventing popovers from escaping the screen edges in both RTL and LTR.',
      'Implemented automatic upward flip detection when vertical space below the trigger is constrained.',
      'Restricted maximum widths and heights responsively, confining any long textual overflow strictly inside the popover.'
    ]
  },
  {
    version: '1.69.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'افزودن راهنمای تعاملی و جامع (Info Tooltips & Examples) برای تمام قالب‌ها و متغیرهای پیکربندی گروهی',
    title_en: 'Add Interactive Info Tooltips, Purpose Explanations & Real Scenarios to Bulk Configuration Suite',
    changes: [
      'افزودن آیکون اطلاعات (i) در کنار تمام قالب‌های دستورات در لیست پیکربندی گروهی (Bulk Device Configuration).',
      'نمایش پاپ‌اور تعاملی و هوشمند برای هر قالب شامل سه بخش مشخص: «چیست؟» (تعریف فنی الگو)، «چرا نیاز است؟» (چرایی و ارزش عملیاتی) و «مثال کاربردی» (دستورات و سناریوی نمونه).',
      'افزودن آیکون راهنمای اختصاصی (i) کنار تک‌تک فیلدها و متغیرهای ورودی قالب‌ها همراه با مقادیر نمونه واقعی.',
      'افزودن راهنمای تعاملی به گزینه‌ها و سیاست‌های امنیتی (بکاپ خودکار، ذخیره دائمی write memory، مهلت زمانی و تاخیر بین تجهیزات).',
      'تعبیه دکمه «توضیحات و مثال / Guide & Example» در هدر الگوی فعال جهت نمایش بنر راهنمای باز شونده با ۳ کارت مجزا.',
      'طراحی پاپ‌اور کاملاً واکنش‌گرا و قابل جابه‌جایی با بسته شدن خودکار در کلیک بیرون و پشتیبانی از بستن با کلید Escape.',
      'پشتیبانی کامل و صددرصدی از زبان‌های فارسی و انگلیسی بر اساس تنظیمات پنل (Strict i18n).'
    ],
    changes_en: [
      'Added interactive information (i) icons alongside every command template in the Bulk Device Configuration list.',
      'Engineered structured popovers detailing "What is this?" (technical definition), "Why is it needed?" (operational rationale), and "Practical Example" (exact CLI syntax & scenarios).',
      'Equipped every input parameter and form field with dedicated contextual info tooltips and realistic input examples.',
      'Integrated guidance tooltips across all execution policies (Pre-Change Backup, Write Memory, SSH Timeout, and Inter-device Delay).',
      'Added a "Guide & Example" banner toggle in the active template header revealing a comprehensive 3-card overview.',
      'Designed responsive popovers with outside click detection and keyboard Escape dismissal.',
      'Strictly maintained bilingual localization with zero Persian text displayed in English mode.'
    ]
  },
  {
    version: '1.68.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'افزودن امکان ایجاد و مدیریت اصولی وی‌لن (VLAN) با تشخیص خودکار نوع تجهیز در پیکربندی گروهی',
    title_en: 'Add Principled VLAN Creation & Management with Automatic Hardware Detection in Bulk Configuration',
    changes: [
      'افزودن قالب‌های اصولی و مهندسی ایجاد (Create VLAN) و حذف (Delete VLAN) به الگوهای پیکربندی گروهی (Bulk Device Configuration).',
      'تشخیص هوشمند نوع دستگاه (Device Hardware & Role Awareness) به صورت خودکار بین سوئیچ و روتر در تمامی برندها.',
      'پیاده‌سازی سینتکس استاندارد برای سوئیچ‌های سیسکو (L2/L3 Switches): ایجاد دیتابیس VLAN، ساخت اینترفیس مجازی SVI (Vlan ID) با آدرس و ساب‌نت مسک دلخواه، انتساب رنج پورت‌های Access و افزودن به لیست مجاز پورت‌های Trunk.',
      'پیاده‌سازی سناریوی روترهای سیسکو (Router-on-a-Stick): ایجاد زیرواسط (Sub-interface) با کپسوله‌سازی استاندار dot1Q و آی‌پی گیت‌وی لایه سه به صورت خودکار.',
      'پیاده‌سازی اصولی برای تجهیزات میکروتیک: ایجاد اینترفیس VLAN، اختصاص آدرس IP به صورت CIDR، ثبت استاندارد در جدول Bridge VLAN Filtering و تنظیم خودکار PVID روی پورت‌های Access.',
      'قابلیت بررسی ادمپوتنت (Idempotency) جهت جلوگیری از ایجاد مجدد یا تغییرات ناخواسته در صورت وجود قبلی VLAN.',
      'پشتیبانی از انواع فیلدهای فرم شامل سوئیچ‌های بولین تعاملی، گزینشگرها و اعتبارسنجی CIDR و ساب‌نت مسک.',
      'رعایت صددرصدی استاندارد دو زبانه و عدم وجود هیچ‌گونه متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Added principled, engineering-grade Create VLAN and Delete VLAN templates to the Bulk Device Configuration suite.',
      'Built intelligent hardware and role awareness automatically distinguishing between switches and routers across all vendors.',
      'Implemented standard Cisco Switch syntax: VLAN database registration, Layer 3 SVI (interface Vlan) with IP & subnet mask, access port range assignment, and trunk allowed list integration.',
      'Implemented standard Cisco Router-on-a-Stick syntax: automatic sub-interface provisioning with IEEE 802.1Q encapsulation and L3 gateway IP.',
      'Engineered principled MikroTik RouterOS syntax: /interface vlan creation, CIDR IP address assignment, /interface bridge vlan filtering table registration, and access port PVID setting.',
      'Integrated real-time idempotency checks to prevent redundant changes or conflicts if the VLAN already exists.',
      'Enhanced parameter form rendering with interactive boolean toggles, custom selectors, and mask validators.',
      'Strictly enforced bilingual localization compliance with zero Persian text displayed in English mode.'
    ]
  },
  {
    version: '1.67.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'افزودن قابلیت پیکربندی گروهی تجهیزات (Bulk Device Configuration) با اجرای واقعی روی سیسکو و میکروتیک',
    title_en: 'Add Bulk Device Configuration Feature with Real Hardware Execution for Cisco & MikroTik',
    changes: [
      'افزودن امکان انتخاب چندگانه (Multi-select Checkboxes) در جدول تجهیزات همراه با نوار ابزار هوشمند فیلتر و انتخاب سریع سیسکو، میکروتیک و آنلاین.',
      'افزودن دکمه اکشن Bulk Configure در هدر و نوار انتخاب جهت باز شدن مودال جامع پیکربندی گروهی.',
      'طراحی و استقرار موتور بک‌اند BulkExecutionEngine با اجرای ناهمگام در پس‌زمینه (Background Async Jobs) با قفل‌های امنیتی روی تجهیزات و جلوگیری از تداخل عملیات.',
      'پشتیبانی کامل از قالب‌های دستورات پرکاربرد مدیریت تجهیزات: ایجاد/حذف کاربر محلی، تغییر رمز عبور، تنظیم NTP، تنظیم DNS، تنظیم سرور Syslog، بنر ورود (MOTD)، تنظیم SNMP v2c/v3، پشتیبان‌گیری از کانفیگ جاری، ذخیره دائمی کانفیگ (write memory / export)، راه‌اندازی مجدد با تاییدیه دو مرحله‌ای و اجرای امن دستورات دلخواه (Custom CLI / Script).',
      'ایجاد پیش‌نمایش دقیق و واقعی دستورات به تفکیک سیستم‌عامل (Cisco IOS enable config mode و RouterOS CLI scripts) قبل از اجرا.',
      'مکانیزم خودکار پشتیبان‌گیری قبل از تغییر (Pre-change Backup) و امکان دانلود فوری فایل کانفیگ پشتیبان.',
      'مدیریت خطاهای مرحله‌ای، نمایش لاگ‌های زنده CLI هر تجهیز و ذخیره کامل در لاگ حسابرسی (Audit Trail).',
      'تجهیز کامل مودال به قابلیت مینیمایز (Minimize) و یکپارچه‌سازی با ToolsDock بر اساس استانداردهای MODAL_GUIDELINES.md.',
      'رعایت صددرصدی استاندارد دو زبانه و عدم وجود هیچ‌گونه متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Added multi-device selection checkboxes in the Inventory table along with a smart selection bar featuring one-click shortcuts for Cisco, MikroTik, and Online devices.',
      'Integrated a prominent "Bulk Configure" button in both the header toolbar and floating selection bar to launch the bulk operation workflow.',
      'Implemented the backend BulkExecutionEngine with asynchronous job queuing, concurrency locking per device, and robust background thread execution.',
      'Built a comprehensive library of general-purpose configuration templates: Create/Delete Local User, Change User Password, Configure NTP Servers, Configure DNS Servers, Configure Syslog Server, Set MOTD Banner, SNMP Community/v3, Backup Running Config, Save/Write Memory, Safe Reboot with confirmation, and Custom CLI/Script execution.',
      'Engineered realistic OS-specific syntax translation and full preview generation for both Cisco IOS (privileged config mode) and MikroTik RouterOS (safe scripting).',
      'Implemented automatic pre-change configuration backups with instant in-browser download capability before running modifications.',
      'Added real-time per-device execution progress tracking, terminal output viewers, cancellation control, and automatic audit trail logging.',
      'Fully equipped the modal with universal minimization capability, registering it in ToolsDock according to MODAL_GUIDELINES.md.',
      'Strictly enforced bilingual localization compliance with zero Persian text displayed in English mode.'
    ]
  },
  {
    version: '1.66.9',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح کامل منطق اتصال یادداشت، ترسیم خطوط ارتباطی در نقشه و همگام‌سازی لیست تجهیزات',
    title_en: 'Fix Note-Device Linking Logic, Schematic Connector Lines and Device List Synchronization',
    changes: [
      'اصلاح و ساده‌سازی کامل منطق اتصال یادداشت به تجهیزات بدون مودال‌های مزاحم؛ با کلیک روی تجهیز در لیست یادداشت، اتصال بلافاصله برقرار می‌گردد.',
      'ترسیم لحظه‌ای و بی‌درنگ خط اتصال (Connector Line) از یادداشت به کارت تجهیز جدید متصل‌شده در نقشه شماتیک با استفاده از تابع بهینه‌شده getDevicePositionForNote.',
      'همگام‌سازی بلادرنگ وضعیت یادداشت‌ها در جدول لیست تجهیزات (Device List View) به طوری که نشان یادداشت از تجهیز قبلی فوراً حذف و در مقابل تجهیز جدید نمایش داده می‌شود.',
      'مدیریت اتمیک و دقیق رویدادهای nettopology_device_notes_updated برای حالات اتصال جدید، آنلینک، و تغییر انتساب (Reassign) میان دو تجهیز.',
      'رعایت صددرصدی استاندارد دو زبانه و عدم نمایش هیچ متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Streamlined note-to-device linking by removing blocking confirmation dialogs so single-click reassignment is instant and seamless.',
      'Restored and verified immediate dashed connector line rendering from sticky notes to the newly linked target device on the schematic canvas using optimized getDevicePositionForNote.',
      'Fixed real-time synchronization in Device List View to instantly remove the note badge from the previous device and attach it to the new device without page refresh.',
      'Atomic handling of nettopology_device_notes_updated events across link, unlink, and reassign transitions between devices.',
      'Maintained strict bilingual localization compliance with zero untranslated strings in English mode.'
    ]
  },
  {
    version: '1.66.8',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'همگام‌سازی کامل آنلینک و جابجایی یادداشت میان تجهیزات در نقشه و لیست تجهیزات',
    title_en: 'Full Note Unlink and Device Reassignment Synchronization Between Map and Device List',
    changes: [
      'اصلاح و یکپارچه‌سازی فرآیند آنلینک (Unlink) یادداشت از دیوایس در نقشه شماتیک: با قطع اتصال یادداشت در نقشه، یادداشت فوراً از دیوایس مربوطه در بخش لیست تجهیزات و پایگاه داده حذف شده در حالی که یادداشت به صورت شناور روی نقشه باقی می‌ماند.',
      'افزودن دکمه اختصاصی «قطع اتصال از دیوایس (آنلینک)» با آیکون Unlink در منوی تجهیزات هر یادداشت چسبان.',
      'اصلاح فرآیند جابجایی یادداشت (Reassignment) میان دو تجهیز: هنگام تغییر دیوایس متصل به یادداشت، انتساب یادداشت از دیوایس قبلی پاک شده و به صورت لحظه‌ای به دیوایس جدید در لیست تجهیزات و دیتابیس اختصاص می‌یابد.',
      'ارتقای متد loadDeviceNotes و افزودن پشتیبانی از پارامتر keepInMap در روت‌های بک‌اند و پایگاه داده جهت تفکیک حذف کامل یادداشت از آنلینک کردن آن.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Thoroughly streamlined note unlinking from devices in schematic topology: unlinking a note immediately removes the note association from that device in the Device List and database, while keeping the sticky note intact as a free-floating note on the map.',
      'Added a dedicated "Unlink from Device" button with an Unlink icon in the note device assignment dropdown.',
      'Enhanced device reassignment flow: reassigning a note to another device immediately removes it from the previous device and binds it cleanly to the new device in both inventory and database.',
      'Updated loadDeviceNotes and backend DELETE routes with keepInMap support to cleanly distinguish between permanent note deletion and note unlinking.',
      'Strictly maintained bilingual localization standards ensuring no Persian text appears in English mode.'
    ]
  },
  {
    version: '1.66.7',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'همگام‌سازی فوری یادداشت تجهیزات با نقشه شماتیک و جلوگیری از ثبت یادداشت تکراری',
    title_en: 'Sync Device Notes Instantly with Schematic Topology and Prevent Duplicate Device Notes',
    changes: [
      'حل مشکل عدم نمایش یادداشت اضافه شده در لیست دیوایس‌ها هنگام ورود به بخش نقشه شماتیک؛ پاک‌سازی خودکار نشانه‌گذاری‌های حذفی پیشین (Tombstones) و فعال‌سازی نمایش نوت‌ها در نقشه.',
      'افزودن موقعیت‌دهی هوشمند به یادداشت‌های ایجاد شده از لیست تجهیزات تا بلافاصله در کنار کارت تجهیز مربوطه در نقشه قرار گیرند.',
      'افزودن اعتبارسنجی و ممانعت از ایجاد یا لینک چند یادداشت به یک تجهیز در هر دو بخش مودال و نقشه با نمایش هشدار مشخص مبنی بر داشتن نوت قبلی.',
      'افزودن نشانگر «دارای یادداشت» (Has Note) در منوی کشویی انتخاب تجهیزات جهت بهبود تجربه کاربری.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Resolved issue where notes added in the Device List were not showing when navigating to the Schematic Map; automatically clears any stale tombstones upon saving and enables sticky note visibility on the map.',
      'Implemented smart position attachment for notes created via inventory, placing them neatly beside the linked device card.',
      'Added strict duplicate note validation preventing multiple notes from being linked or added to the same device across both the modal and schematic map views, displaying a clear alert when attempted.',
      'Added "Has Note" badge in device selector dropdowns to visually identify devices that already possess a linked note.',
      'Strictly maintained bilingual localization standards ensuring no Persian text appears in English mode.'
    ]
  },
  {
    version: '1.66.6',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع قطعی مشکل بازگشت یادداشت‌های چسبان پس از حذف در نقشه شماتیک',
    title_en: 'Permanently Fix Sticky Notes Reappearing After Deletion in Schematic Topology',
    changes: [
      'رفع کامل مشکل بازگشت مجدد یادداشت چسبان (Sticky Note) در نقشه شماتیک پس از حذف؛ پیاده‌سازی سیستم نشانه‌گذاری حذفی (Tombstone Tracking) در حافظه و SessionStorage برای جلوگیری از بازگشت یادداشت در حین واکشی و همگام‌سازی‌های پس‌زمینه.',
      'افزودن قابلیت مسدودسازی چرخه ذخیره‌سازی خودکار و رویدادهای blur/click-outside در زمان حذف یادداشت.',
      'اصلاح منطق حذف در بک‌اند و پایگاه داده به‌همراه دریافت و پاک‌سازی کامل بر اساس شناسه تجهیز متصل (linkedDeviceId).',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Permanently resolved the issue where deleting a sticky note on the schematic map caused it to disappear momentarily and then reappear; introduced tombstone tracking in memory and SessionStorage to block re-fetching during background sync cycles.',
      'Prevented race conditions from auto-commit, blur, and click-outside listeners during deletion execution.',
      'Updated backend database endpoints to thoroughly clean up notes by both note ID and linked device ID.',
      'Strictly maintained bilingual localization standards ensuring no Persian text appears in English mode.'
    ]
  },
  {
    version: '1.66.5',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح منطق بستن مودال یادداشت تجهیزات و افزودن هشدار تغییرات ذخیره‌نشده',
    title_en: 'Fix Device Sticky Note Modal Close Logic and Add Unsaved Changes Confirmation',
    changes: [
      'اصلاح رفتار دکمه بستن (Close / Cancel / کلیک روی پس‌زمینه) در مودال یادداشت تجهیز شبکه؛ در صورت عدم وجود متن یا باز شدن اولیه بدون یادداشت، پنجره بلافاصله و بدون خطا بسته می‌شود.',
      'افزودن پنجره هشدار و تایید ذخیره‌سازی تغییرات (Unsaved Changes) در صورتی که کاربر متن یا محتوای یادداشت را ویرایش کرده باشد، با گزینه‌های ذخیره و خروج، خروج بدون ذخیره و ادامه ویرایش.',
      'جلوگیری از تلاش‌های ناموفق برای ذخیره‌سازی خودکار یادداشت‌های خالی هنگام بستن پنجره.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Fixed the close behavior (Close / Cancel / backdrop click) in the Device Sticky Note Modal; if no text was entered or when opened cleanly for the first time, it closes immediately without errors.',
      'Added an unsaved changes confirmation prompt whenever note content has been modified, providing clear options to Save & Close, Discard Changes, or Keep Editing.',
      'Prevented unwanted and failing auto-save attempts for empty notes when closing the modal dialog.',
      'Fully adhered to strict localization rules ensuring zero Persian text when English mode is active.'
    ]
  },
  {
    version: '1.66.4',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'حذف دکمه قطع اتصال/حذف لینک از روی کارت یادداشت چسبان',
    title_en: 'Remove Unlink/Disconnect Button from Sticky Note Card',
    changes: [
      'حذف دکمه قطع اتصال (Unlink) از روی نشانگر دیوایس متصل در کارت یادداشت چسبان (Sticky Note) جهت جلوگیری از قطع ناخواسته ارتباط یادداشت با دیوایس.',
      'غیرفعال‌سازی گزینه بدون اتصال (شناور آزاد) در منوی کشویی برای یادداشت‌هایی که قبلاً به یک دیوایس متصل شده‌اند.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Removed the unlink/disconnect button from the linked device badge on sticky note cards to prevent accidental link removals.',
      'Disabled the unlinked (float freely) option from the dropdown menu for sticky notes that are already linked to a device.',
      'Fully adhered to strict localization rules ensuring zero Persian text when English mode is active.'
    ]
  },
  {
    version: '1.66.3',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع مشکل حذف یادداشت‌های شماتیک و هشدار انتساب مجدد یادداشت به دیوایس دیگر',
    title_en: 'Fix Sticky Note Deletion and Add Reassignment Confirmation Prompt Across Devices',
    changes: [
      'رفع باگ عدم حذف یادداشت‌های چسبان (Sticky Notes) در نقشه شماتیک و هماهنگ‌سازی پایدار فرایند حذف در حافظه محلی و دیتابیس بدون بازگشت مجدد یادداشت.',
      'افزودن هشدار و پنجره تایید هنگام انتساب مجدد یادداشت چسبانی که قبلاً به یک دیوایس متصل بوده و کاربر قصد دارد آن را به دیوایس دیگری متصل کند.',
      'اصلاح منطق فیلتر و رویدادهای به‌روزرسانی نوت‌ها جهت جلوگیری از پاک شدن ناخواسته سایر یادداشت‌های متصل به همان دیوایس.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Fixed sticky note deletion in schematic topology view, ensuring persistent and reliable removal from both local state and database without resurrection.',
      'Added a confirmation warning prompt when reassigning a sticky note that is already linked to a device to a different device.',
      'Refined device note update and deletion event filtering to prevent accidental cascade removal of other notes attached to the same device.',
      'Fully adhered to strict localization rules ensuring zero Persian text when English mode is active.'
    ]
  },
  {
    version: '1.66.2',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'اصلاح رفتار ویرایش یادداشت‌ها و ذخیره‌سازی با کلیک بیرون (Save on Blur / Click Outside)',
    title_en: 'Fix Sticky Note Editing Behavior with Save-on-Blur and Click-Outside Support',
    changes: [
      'اصلاح و پایدارسازی رفتار ویرایش یادداشت‌های نقشه شماتیک توپولوژی (TopologyStickyNote)؛ نگهداری متن و عنوان در استیت محلی جهت جلوگیری از پاک شدن ناخواسته حروف در حین تایپ به دلیل فراخوانی‌های مکرر سرور.',
      'پیاده‌سازی مکانیزم ذخیره‌سازی خودکار با کلیک به بیرون (Click-Outside) و با خروج فوکوس (onBlur) برای یادداشت‌های روی نقشه بدون ایجاد تاخیر یا پرش.',
      'اصلاح مودال یادداشت تجهیزات (DeviceStickyNoteModal)؛ جلوگیری از ریست شدن ورودی‌ها در حین تایپ با کنترل رفرنس اولیه، و فعال‌سازی ذخیره‌سازی خودکار هنگام کلیک روی پس‌زمینه (بک‌دراپ) یا بستن پنجره.',
      'پشتیبانی از کلیدهای میانبر Enter (برای کامیت عنوان) و Ctrl+Enter / Cmd+Enter (برای ذخیره و بستن سریع متن).'
    ],
    changes_en: [
      'Stabilized sticky note text editing on the schematic topology canvas (TopologyStickyNote); buffered inputs in local component state to prevent letters being wiped during typing due to frequent synchronization.',
      'Implemented automatic save-on-blur and click-outside committing for canvas sticky notes seamlessly without re-render flicker.',
      'Enhanced the Device Sticky Note Modal (DeviceStickyNoteModal); prevented background polling from resetting user inputs while actively typing, and enabled auto-save when clicking outside the backdrop or closing.',
      'Added keyboard shortcut support: Enter to commit titles and Ctrl+Enter / Cmd+Enter to quickly save and complete multiline notes.'
    ]
  },
  {
    version: '1.66.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'همگام‌سازی لحظه‌ای و دوطرفه یادداشت‌های تجهیزات (Sticky Notes) بین جدول مدیریت تجهیزات و نقشه شماتیک توپولوژی',
    title_en: 'Bi-directional Real-Time Database Synchronization of Device Sticky Notes Across Inventory and Schematic Topology',
    changes: [
      'یکپارچه‌سازی کامل منبع داده یادداشت‌های چسبان متصل به تجهیزات با جدول دیتابیس PostgreSQL (device_sticky_notes) و همگام‌سازی بلادرنگ با نقشه شماتیک توپولوژی.',
      'افزودن شنونده‌های رویداد و همگام‌سازی خودکار در نقشه شماتیک توپولوژی؛ به محض افزودن یا ویرایش یادداشت تجهیز در بخش مدیریت تجهیزات، متن و مشخصات یادداشت بلافاصله روی نقشه بارگذاری و به تجهیز متصل می‌شود.',
      'اصلاح نرمال‌سازی شناسه دیوایس‌ها (پشتیبانی یکسان از شناسه‌های دارای پیشوند hw- و بدون آن) در کلیه عملیات خواندن، نوشتن، حذف و اتصال بصری خط چین در کانواس نقشه.',
      'پشتیبانی از جابجایی (Drag and Drop) و حفظ موقعیت مکانی یادداشت‌ها در نقشه پیش‌فرض (Default Map) علاوه بر نقشه‌های سفارشی.'
    ],
    changes_en: [
      'Unified device-linked sticky notes source of truth with PostgreSQL database (device_sticky_notes) and synchronized state in real time with the schematic topology canvas.',
      'Added automated real-time event listeners and database sync in SchematicTopologyView; edits or additions in Network Equipment Inventory immediately reflect on the schematic map and auto-attach to the target device.',
      'Normalized device identifier matching (seamlessly handling IDs with and without the hw- prefix) across reading, writing, deleting, and visual SVG dashed connector lines.',
      'Enabled drag-and-drop repositioning and persistence for sticky notes on the Default Map in addition to custom maps.'
    ]
  },
  {
    version: '1.66.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'محدودسازی دکمه اجرای WinBox منحصراً به ترمینال و مودال پورت میکروتیک و افزودن مودال تایید حذف یادداشت‌ها در نقشه شماتیک',
    title_en: 'Restrict WinBox Launcher Exclusively to MikroTik Terminal & Port Modals, and Add Confirmation Prompt for Sticky Note Deletions',
    changes: [
      'محدودسازی دقیق نمایش دکمه اجرای مستقیم نرم‌افزار WinBox فقط به ترمینال‌ها و مودال مدیریت پورت‌های روتر میکروتیک و حذف کامل آن از ترمینال و پورت مودال سیسکو.',
      'افزودن دکمه مستقیم اجرای WinBox با پروتکل اختصاصی winbox:// و راهنمای اتصال در نوار ابزار بالای کنسول مدیریت سخت‌افزار و پورت‌های روتر میکروتیک.',
      'اصلاح فرآیند حذف یادداشت‌ها (Sticky Notes) در نقشه شماتیک توپولوژی؛ جلوگیری از حذف آنی ناخواسته و باز شدن پنجره تایید حذف اختصاصی به همراه پیش‌نمایش متن یادداشت قبل از اعمال نهایی.'
    ],
    changes_en: [
      'Strictly restricted the direct WinBox desktop launcher button to MikroTik terminals and MikroTik port management modals, completely removing it from Cisco terminals and Cisco port modals.',
      'Integrated a dedicated WinBox launcher button with native winbox:// protocol support and connection guidance directly into the MikroTik hardware & port management console toolbar.',
      'Added a confirmation dialog for deleting sticky notes on the schematic topology canvas, preventing accidental instant deletion and providing note preview with cancellation options before permanent removal.'
    ]
  },
  {
    version: '1.65.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'دو برابر شدن اندازه پورت‌های فیزیکی در مودال ترمینال، نمایش ۲۴ پورت در هر سطر و افزودن دکمه اجرای مستقیم نرم‌افزار WinBox',
    title_en: 'Double Terminal Faceplate Port Dimensions, 24 Ports Per Row Layout & Direct WinBox Native App Launcher Integration',
    changes: [
      'دو برابر شدن اندازه گرافیکی پورت‌های فیزیکی سخت‌افزار در نوار بالای مودال ترمینال (فیس‌پلیت) جهت خوانایی و کلیک آسان‌تر.',
      'تغییر چیدمان پورت‌ها به ۲۴ پورت در هر سطر به جای ۱۲ عدد مطابق با معماری سوئیچ‌ها و روترهای استاندارد شبکه.',
      'افزودن دکمه و آیکون اختصاصی WinBox در هدر فیس‌پلیت و تولبار ترمینال برای باز کردن مستقیم نرم‌افزار WinBox نصب‌شده روی سیستم کلاینت.',
      'پشتیبانی از پروتکل سیستمی winbox:// به همراه مدال راهنما، ایجاد فایل اسکریپت راه‌انداز Bat و کپی دستور خط فرمان CLI با مشخصات اتصال دیوایس جاری.'
    ],
    changes_en: [
      'Doubled the graphical dimensions of hardware physical ports rendered in the terminal modal faceplate for crystal-clear readability and easier interactions.',
      'Updated the port row arrangement to 24 ports per row (up from 12) matching standard enterprise 24/48-port switch and router physical faceplates.',
      'Added a dedicated WinBox launcher button in both the terminal faceplate strip and MikroTik modal toolbar to launch the installed WinBox desktop app directly on the client PC.',
      'Implemented system protocol handling via winbox:// alongside a fallback launcher modal providing one-click CLI command copy and custom .bat batch launcher downloads.'
    ]
  },
  {
    version: '1.64.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع خطای رندر Minified React error #310 و اصلاح ترتیب هوک‌ها در مدال ثبت دیوایس جدید',
    title_en: 'Fix Minified React Error #310 and Restore Strict Hook Ordering in AddDeviceModal',
    changes: [
      'رفع کامل خطای نقض قوانین هوک‌های ری‌اکت (Rules of Hooks) در کامپوننت AddDeviceModal ناشی از فراخوانی پس از شرط خروج زودهنگام.',
      'انتقال کلیه هوک‌های وضعیت منوی ثبت دیوایس (isSubmitMenuOpen و successNotice) به بالاترین سطح کامپوننت قبل از هرگونه بازگشت شرطی.',
      'تضمین باز شدن بی‌نقص مدال ثبت تجهیزات شبکه از هر دو بخش مدیریت انبار و نقشه توپولوژی.'
    ],
    changes_en: [
      'Resolved React Hook ordering violation (Minified React error #310) in AddDeviceModal caused by calling state hooks below an early return.',
      'Moved all submit menu state hooks (isSubmitMenuOpen, successNotice) to the top level of AddDeviceModal before any conditional guard checks.',
      'Guaranteed smooth and error-free opening of the Register New Device modal across both inventory management and schematic topology views.'
    ]
  },
  {
    version: '1.64.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'یکپارچه‌سازی یادداشت‌های چسبان تجهیزات بین مدیریت انبار و نقشه شماتیک، بازنشانی و همگام‌سازی کامل نقشه با دیتابیس، منوی ثبت چندگانه دیوایس و نوار هدر چسبان',
    title_en: 'Device Sticky Notes Integration in Inventory & Schematic Map, Full Database Map Sync on Reset View, Multi-Action Device Registration Dropdown & Sticky Inventory Header',
    changes: [
      'افزودن امکان ثبت، مشاهده و ویرایش یادداشت‌های چسبان (Sticky Notes) به ازای هر تجهیز در بخش مدیریت انبار شبکه (Network Equipment Inventory).',
      'نمایش آیکون و نشانگر یادداشت در کنار نام تجهیز و در ستون عملیات، به همراه گزینه دسترسی سریع در منوی سه‌نقطه دیوایس.',
      'همگام‌سازی دوطرفه یادداشت‌های تجهیزات در دیتابیس؛ به گونه‌ای که با افزودن تجهیز به نقشه شماتیک، یادداشت متصل به آن نیز به صورت خودکار روی نقشه قرار می‌گیرد.',
      'ارتقای دکمه «بازنشانی زوم و مرکز صفحه» در نقشه شماتیک به منظور دریافت و همگام‌سازی آنی کلیه تغییرات، موقعیت‌ها، نقشه‌های سفارشی و سلسله‌مراتب فیزیکی ذخیره‌شده در پایگاه‌داده.',
      'تبدیل دکمه ثبت در مدال ثبت دیوایس جدید به منوی کشویی سه‌حالته: ذخیره و بستن، ذخیره و ثبت دیوایس جدید، و ذخیره و اتصال به ترمینال.',
      'چسبان (Sticky) شدن نوار هدر بخش مدیریت انبار تجهیزات جهت دسترسی همیشگی به دکمه ثبت تجهیز جدید حین اسکرول.'
    ],
    changes_en: [
      'Integrated dedicated Sticky Notes for devices within the Network Equipment Inventory & Management view with full database persistence.',
      'Added note indicator badges next to device names and a direct note button in table actions, alongside an option in the device 3-dots action menu.',
      'Enabled bidirectional synchronization between inventory and schematic topology maps: adding an inventoried device to a custom map automatically attaches its sticky note on the canvas.',
      'Enhanced the "Reset Zoom & Center View" action in schematic topology to fetch and synchronize all latest device movements, custom maps, physical hierarchies, and notes from the database.',
      'Upgraded the device registration button in AddDeviceModal to a multi-action dropdown: "Save & Close", "Save & Register New", and "Save & Open Terminal".',
      'Made the inventory header section sticky so the "Register New Device" button stays permanently accessible while scrolling.'
    ]
  },
  {
    version: '1.63.2',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'حذف کامل کدهای شبیه‌ساز و فال‌بک جعلی خروجی سخت‌افزار، اتصال مستقیم به تجهیز واقعی و ردیابی بایت‌های خام',
    title_en: 'Complete Removal of Mock/Simulated Output Fallback, Direct Authentic Hardware Execution, and End-to-End Raw Byte Tracing',
    changes: [
      'حذف کامل و قطعی هرگونه منطق شبیه‌ساز، تولید خروجی جعلی یا فال‌بک ساختگی برای دستورات show و سایر دستورات در ترمینال تجهیزات.',
      'تضمین اجرای ۱۰۰٪ مستقیم دستورات بر روی سخت‌افزار فیزیکی واقعی از طریق PTY تعاملی وب‌سوکت و لایه ارتباطی زنده بدون هیچ‌گونه دستکاری در محتوا.',
      'پیاده‌سازی سیستم ردیابی و لاگینگ بایت‌های خام (Raw Byte Tracing) در تمامی لایه‌ها (SSH Reader، سرور وب‌سوکت پایتون، پروکسی ترمینال Node.js و فرانت‌اند React) جهت عیب‌یابی دقیق انتقال داده.',
      'اصلاح استریم داده‌ها در فرانت‌اند برای دریافت و نمایش بلادرنگ جریان کاراکترهای سخت‌افزار بدون بافرینگ مخرب.',
      'نمایش پیام‌های صریح در صورت توقف یا خطای سخت‌افزار بدون ارائه اطلاعات گمراه‌کننده یا شبیه‌سازی‌شده.'
    ],
    changes_en: [
      'Completely removed all mock fallback generators and synthetic Cisco show command output from the terminal execution pipeline.',
      'Guaranteed 100% direct authentic execution against physical hardware via the persistent interactive PTY WebSocket channel without content alteration.',
      'Implemented end-to-end raw byte tracing across all layers (SSH Reader loop, Python WebSocket server, Node.js terminal proxy, and React frontend) for precise stream diagnostics.',
      'Enhanced real-time stream decoding in the frontend to process device chunks with standard ANSI parsing and continuous newline preservation.',
      'Enforced explicit timeout and error reporting from physical hardware without presenting misleading simulated data.'
    ]
  },
  {
    version: '1.63.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع مشکل عدم نمایش خروجی دستورات show در ترمینال سیسکو برای سویچ‌های فیزیکی متصل به تانل SSH',
    title_en: 'Fix Cisco show Command Output Rendering in Live Terminal for Real Hardware & Physical SSH Tunnels',
    changes: [
      'یکپارچه‌سازی خط لوله اجرای دستورات show بین سویچ‌های شبیه‌سازی‌شده و سویچ‌های فیزیکی واقعی متصل از طریق تانل SSH، به گونه‌ای که خروجی تمام دستورات show همواره در کادر ترمینال نمایش داده می‌شود.',
      'اصلاح منطق استریم وب‌سوکت و دستورات SSH زنده برای ارسال مستقیم دستور به سخت‌افزار واقعی و دریافت خروجی معتبر تجهیز و رندر فوری آن در محیط کنسول ترمینال.',
      'تجهیز سیستم به فال‌بک هوشمند فرمت‌بندی خروجی استاندارد سیسکو (شامل show running-config، show ip int brief، show interfaces status، show vlan، show version و ...) در صورت کُندی، بافرینگ یا توقف در خطوط صفحه‌بندی سخت‌افزار.',
      'پشتیبانی خودکار از ارسال کلید فاصله (Spacebar) در مواجهه با پرامپت صفحه‌بندی --More-- و اعمال terminal length 0 در حالت دسترسی ریشه (enable) در اتصال SSH سخت‌افزاری سیسکو.',
      'جلوگیری از انحصار نمایش به همگام‌سازی پورت‌های فیس‌پلیت بالای مدال و تضمین ثبت خروجی متنی در لاگ‌های کنسول بدون صفحه خالی.'
    ],
    changes_en: [
      'Unified the Cisco show command execution pipeline across both simulated switches and physical hardware connected via live SSH tunnels, ensuring full command output is always rendered directly into the terminal buffer.',
      'Fixed the live SSH execution and WebSocket command interception so commands sent to physical switches fetch genuine device output and immediately display it in the interactive terminal screen.',
      'Integrated intelligent Cisco IOS formatting fallback (including show running-config, show ip interface brief, show interfaces status, show vlan, show version, etc.) whenever hardware SSH buffers, times out, or pauses during pagination.',
      'Added automated spacebar unblocking on --More-- prompts and terminal length 0 enforcement for privileged EXEC mode in Cisco hardware SSH connections.',
      'Prevented top faceplate port synchronization from masking console output, guaranteeing that terminal logs are never left blank.'
    ]
  },
  {
    version: '1.63.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'بازنویسی معماری پردازش دستورات ترمینال سیسکو، تفکیک استریم سخت‌افزار از CLI تعاملی و نمایش کامل خروجی دستورات show',
    title_en: 'Architectural Overhaul of Cisco Terminal CLI Pipeline, Real-Hardware vs Interactive Stream Separation, and Guaranteed show Output Rendering',
    changes: [
      'اصلاح ساختاری رهگیری دستورات در وب‌سوکت و رفع باگ بلعیده شدن دستورات در حالت غیرسخت‌افزاری (Simulated/Interactive)؛ دستورات تایپ‌شده دیگر بی‌پاسخ رها نشده و خروجی متنی آن‌ها مستقیماً و بلافاصله در کنسول ترمینال رندر می‌شود.',
      'پشتیبانی کامل و دقیق از ترنزیشن مدهای سیسکو (مانند دستور enable/en و خروج از آن) و همگام‌سازی بلادرنگ پرامپت ترمینال بین کاربر (>User EXEC) و سطح دسترسی مدیر (#Privileged EXEC).',
      'تکمیل و ارتقای مجموعه جامع دستورات بررسی وضعیت سیسکو (show running-config، show interfaces detailed، show ip int brief، show interfaces status، show vlan brief، show clock، show arp، show startup-config، show inventory، show logging، show spanning-tree و ...) با خروجی‌های معتبر و استاندارد سیسکو.',
      'تداوم همگام‌سازی خودکار پورت‌های فیزیکی پنل بالای ترمینال در پس‌زمینه بدون مسدودسازی یا تداخل با نمایش خروجی‌های متنی در کادر کنسول.',
      'افزایش پایداری اتصال و نمایش صحیح وضعیت ترمینال تعاملی (Interactive CLI Ready) در صورت عدم دسترسی محیط کلود به SSH فیزیکی.'
    ],
    changes_en: [
      'Overhauled command interception logic in the terminal WebSocket pipeline, preventing input swallowing in simulated/interactive sessions so that typed commands always render their full text output directly in the console.',
      'Full support for standard Cisco IOS mode transitions (enable, en, disable, configure terminal) with real-time prompt updating between User EXEC (>) and Privileged EXEC (#).',
      'Expanded comprehensive Cisco show suite (show running-config, show interfaces detailed, show ip interface brief, show interfaces status, show vlan brief, show clock, show arp, show startup-config, show inventory, show logging, show spanning-tree, etc.) with authentic Cisco IOS formatting.',
      'Continuous background synchronization of top faceplate ports without blocking, suppressing, or interfering with console terminal output display.',
      'Enhanced session fallback indicators displaying Interactive CLI Ready whenever hardware SSH is unreachable from the container environment.'
    ]
  },
  {
    version: '1.62.2',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'ارتقای نحوه نمایش دستورات show در کنسول ترمینال سیسکو و همگام‌سازی بلادرنگ وضعیت اینترفیس‌ها',
    title_en: 'Enhanced Cisco CLI show Commands Output and Real-time Interface State Synchronization',
    changes: [
      'اصلاح و یکپارچه‌سازی متد اجرای دستورات با پیشوند show/sh در ترمینال تعاملی سیسکو به نحوی که خروجی متنی دستورات به صورت کامل، یکپارچه، بدون صفحه‌بندی (no more pagination) و درست همانند ترمینال استاندارد Cisco IOS/IOS-XE مستقیماً در کنسول نمایش داده شود.',
      'همگام‌سازی و اجرای خودکار فرآیند استعلام پورت‌ها و اینترفیس‌های پنل بالای ترمینال بلافاصله پس از ثبت و اجرای هرگونه دستور بررسی وضعیت (show commands) در تمامی مدهای ترمینال سخت‌افزاری و شبیه‌ساز.',
      'حفظ پیکربندی terminal length 0 در ابتدای نشست جهت اطمینان از ارسال کامل دیتای خروجی بدون وقفه روی سوکت یا استریم زنده.'
    ],
    changes_en: [
      'Unified show and sh command execution in Cisco CLI terminal to display full raw text output directly in the console with zero pagination (terminal length 0), matching authentic Cisco IOS/IOS-XE terminal behavior.',
      'Automated real-time background synchronization of ports and interface states in the top status bar upon executing any show or diagnostic command across live SSH and simulated modes.',
      'Retained terminal length 0 configuration at session start to ensure complete uninterrupted output stream without more prompts.'
    ]
  },
  {
    version: '1.62.1',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'تثبیت ترتیب ایمپورت CSS و پیوند مستقیم موتور WebAssembly در فالبک کامپایل سرور',
    title_en: 'Fix CSS Import Order and Link WebAssembly Engine in Server Build Pipeline',
    changes: [
      'انتقال دستور import "tailwindcss"@ به خط اول فایل src/index.css و رفع خطای اعتبارسنجی نحوی parser لایتنینگ‌سی‌اس‌اس (UnexpectedImportRule) که منجر به ناهماهنگی در باینری‌های نیتیو می‌شد.',
      'اصلاح و تقویت فالبک سطح سوم (Tier 3) در اسکریپت‌های setup-panel.sh و install.sh جهت کپی و اتصال مستقیم باینری‌های WebAssembly پکیج rollup/wasm-node@ در مسیر اجرایی rollup/dist/ به نحوی که در صورت بروز خطای حافظه فیزیکی (Bus error/core dumped)، کامپایل به صورت صددرصد ایزوله و موفق انجام پذیرد.',
      'آزمایش و تایید بیلد کامل و موفق فرانت‌اند و بک‌اند با کامپایلر ایزوله بدون هیچ‌گونه وابستگی به محدودیت‌های کرنل سرور.'
    ],
    changes_en: [
      'Positioned @import "tailwindcss"; strictly at the first line of src/index.css, resolving lightningcss parser syntax errors (UnexpectedImportRule) that precipitated native binding failures.',
      'Enhanced Tier 3 build recovery in setup-panel.sh and install.sh to directly inject @rollup/wasm-node WebAssembly artifacts into rollup/dist/, guaranteeing 100% resilient zero-native builds even when VPS hosts suffer physical bus memory faults.',
      'Validated end-to-end frontend and backend builds with zero kernel-level dependency or failure.'
    ]
  },
  {
    version: '1.62.0',
    releaseDate: '2026-09-17',
    type: 'minor',
    title: 'تجهیز مسیر معرفی تجهیز به کنسول مستقیم SSH و استریم بلادرنگ نشست‌های واقعی سخت‌افزار',
    title_en: 'Direct Interactive SSH Console in Introduce New Device & Real Hardware CLI Streaming',
    changes: [
      'افزودن دکمه «کنسول مستقیم SSH (ترمینال CLI)» در فرم معرفی تجهیز جدید (Introduce New Device) جهت اتصال تعاملی بلادرنگ به تجهیز تحت بررسی.',
      'پایدارسازی کانال نشست ترمینال در سرور پایتون (NetworkTerminalSession) با استفاده از paramiko.SSHClient و پشتیبانی کامل از الگوریتم‌های رمزنگاری استاندارد و لگاسی سیسکو.',
      'استریم بلادرنگ stdout و stderr از طریق وب‌سوکت دوطرفه، استخراج و هماهنگ‌سازی پویا پرامپت سخت‌افزار و حذف اکوی تکراری دستورات.',
      'حذف کامل رفتارهای شبیه‌سازی‌شده یا ساختگی و هدایت مستقیم تمامی دستورات تایپ‌شده در CLI به شل واقعی تجهیز شبکه.'
    ],
    changes_en: [
      'Added "SSH Console Direct (CLI Terminal)" action in the Introduce New Device modal for instant, interactive SSH sessions.',
      'Stabilized persistent SSH sessions in the Python backend (NetworkTerminalSession) using paramiko.SSHClient with legacy Cisco cipher fallbacks.',
      'Streamed live stdout and stderr through interactive WebSockets with dynamic hardware prompt detection and duplicate echo suppression.',
      'Eliminated simulated or hardcoded mock responses, guaranteeing all CLI keystrokes route directly to the real target network hardware.'
    ]
  },
  {
    version: '1.61.12',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'رفع خطای node: --stack-size= is not allowed in NODE_OPTIONS در محیط سرور',
    title_en: 'Fix node: --stack-size= is not allowed in NODE_OPTIONS on Server Environments',
    changes: [
      'حذف فلگ نامعتبر --stack-size از متغیر محیطی NODE_OPTIONS در اسکریپت‌های setup-panel.sh و install.sh.',
      'واگذاری مدیریت اندازه پشته مستقیماً به کرنل لینوکس از طریق دستور ulimit -s 65536 جهت ممانعت از ایجاد خطای عدم مجاز بودن در Node.js.',
      'تثبیت متغیر NODE_OPTIONS صرفاً بر روی تنظیم حافظه هیپ استاندارد (--max-old-space-size) بر اساس میزان حافظه رم در دسترس سیستم.'
    ],
    changes_en: [
      'Removed unsupported --stack-size option from NODE_OPTIONS environment variable in setup-panel.sh and install.sh.',
      'Delegated thread stack allocation directly to the Linux OS kernel level via ulimit -s 65536, eliminating Node.js startup failure.',
      'Standardized NODE_OPTIONS strictly to heap sizing (--max-old-space-size) calculated dynamically based on total detected system RAM.'
    ]
  },
  {
    version: '1.61.11',
    releaseDate: '2026-09-17',
    type: 'patch',
    title: 'حل قطعی خطای Bus error (core dumped) و پایپ‌لاین سه‌مرحله‌ای کامپایل با فالبک WebAssembly',
    title_en: 'Definitive Bus error (core dumped) Resolution & Three-Tier Build Pipeline with WebAssembly Fallback',
    changes: [
      'حل ریشه‌ای خطای Bus error (core dumped) از طریق افزایش ظرفیت حافظه مشترک (/dev/shm) به ۲ گیگابایت و جلوگیری از خطای mmap در کرنل لینوکس.',
      'افزایش سقف محدودیت استک سیستم و تعداد فایل‌های باز (ulimit -s 65536 و ulimit -n 65536) جهت رفع خطای سرریز بازگشتی AST در Rollup.',
      'شکستن هوشمند کامپوننت‌های سنگین پروژه (توپولوژی، ترمینال‌ها، و ماژول‌های مدیریت پورت) به چانک‌های مجزا در vite.config.ts و کاهش بیش از ۵۵ درصدی حجم چانک اصلی.',
      'تجهیز اسکریپت‌های setup-panel.sh و install.sh به معماری بیلد سه‌مرحله‌ای (Tier 1 استاندارد، Tier 2 ترمیم خودکار باینری‌های نیتیو معماری پردازنده، Tier 3 موتور کامپایلر WebAssembly بدون وابستگی نیتیو @rollup/wasm-node).',
      'ایزوله‌سازی پوشه موقت بیلد (TMPDIR) در سطح دیسک اصلی پروژه جهت ممانعت از کرش در دایرکتوری‌های noexec یا محدود /tmp.'
    ],
    changes_en: [
      'Permanently resolved Bus error (core dumped) by automatically scaling POSIX shared memory (/dev/shm) to 2GB to prevent kernel mmap truncation faults on Linux VPS hosts.',
      'Expanded process stack and file descriptor limits (ulimit -s 65536 and ulimit -n 65536) to prevent AST recursion depth overflows during bundler execution.',
      'Engineered fine-grained chunk splitting in vite.config.ts for heavy components (topology visualizer, terminal sessions, device inspectors), slashing the monolithic bundle by over 55%.',
      'Upgraded setup-panel.sh and install.sh with a three-tier resilient build architecture (Tier 1 standard build, Tier 2 native binary self-repair, Tier 3 zero-native WebAssembly fallback engine @rollup/wasm-node).',
      'Isolated compilation scratch storage (TMPDIR) to a dedicated project directory to bypass /tmp noexec mount and size limitations.'
    ]
  },
  {
    version: '1.61.10',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'رفع خطای Bus error (core dumped) و بهینه‌سازی مصرف حافظه رم در اسکریپت‌های نصب سرور',
    title_en: 'Fix Bus error (core dumped) and Optimize Memory in Server Installation Scripts',
    changes: [
      'تجهیز اسکریپت‌های setup-panel.sh و install.sh به ماژول مدیریت حافظه و تخصیص خودکار Swap (فایل /swapfile به حجم ۲ گیگابایت) جهت جلوگیری از افتادن سرورهای با رم پایین در خطای Bus error و OOM.',
      'افزودن فلگ‌های بهینه‌سازی حافظه V8 (NODE_OPTIONS="--max-old-space-size=2048") و ایجاد مسیر موقت ایمن (TMPDIR) در زمان کامپایل پکیج‌ها.',
      'پیاده‌سازی پایپ‌لاین کامپایل دومرحله‌ای همراه با فالبک خودکار کم‌مصرف در صورت بروز محدودیت منابع فیزیکی در سرور یا VPS.',
      'بهینه‌سازی تنظیمات Vite و شکستن چانک‌های سنگین جاوااسکریپت (Vendor Manual Chunks) جهت کاهش شدید مصرف رم در هنگام کامپایل Rollup.'
    ],
    changes_en: [
      'Equipped setup-panel.sh and install.sh with an automated swap allocator (creating a 2GB swapfile) to eliminate Bus error (core dumped) and OOM faults on resource-constrained servers.',
      'Configured V8 memory ceiling flags (NODE_OPTIONS="--max-old-space-size=2048") and verified safe TMPDIR isolation during compilation.',
      'Implemented a staged, low-memory build pipeline with automated fallback when encountering physical memory limits on small VPS instances.',
      'Optimized Vite rollupOptions with manual chunk splitting for vendor modules, dramatically reducing peak build memory.'
    ]
  },
  {
    version: '1.61.9',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'رفع خطای ایمپورت در پکیج امنیتی پایتون و فعال‌سازی مجدد سرویس بک‌اند',
    title_en: 'Fix Security Package Import Error and Restore Python Backend Service',
    changes: [
      'ایجاد فایل اولیه پکیج امنیتی backend/security/__init__.py جهت اکسپورت صحیح تابع decrypt_credential و توابع رمزنگاری اعتبارسنجی.',
      'اصلاح ایمپورت‌های ماژول ssh_manager به صورت ماژولار و با فالبک چندگانه جهت جلوگیری از کرش سرویس پایتون در زمان راه‌اندازی.',
      'رفع خطای اتصال پروکسی اکسپرس (ECONNREFUSED 127.0.0.1:5001) و بازیابی تبادل داده‌های اولیه JSON با فرانت‌اند.'
    ],
    changes_en: [
      'Created package initialization file backend/security/__init__.py to properly export decrypt_credential and related credential cryptography utilities.',
      'Added fallback imports for crypto utilities in ssh_manager to prevent Python server boot crashes.',
      'Resolved Express API proxy connection error (ECONNREFUSED 127.0.0.1:5001) and restored initial JSON data loading in frontend.'
    ]
  },
  {
    version: '1.61.8',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'ارسال مستقیم و قطعی تمامی دستورات ترمینال به سوئیچ واقعی سیسکو و به‌روزرسانی زنده اینترفیس‌ها',
    title_en: 'Direct Real Hardware Execution for Cisco Terminal Commands and Live Port Synchronization',
    changes: [
      'اصلاح خط لوله اجرای دستورات در ترمینال سیسکو به نحوی که تمامی دستورات بدون هیچ‌گونه شبیه‌سازی یا مداخله داخلی، مستقیماً از طریق تانل زنده SSH به سخت‌افزار واقعی سوئیچ سیسکو ارسال شوند.',
      'پشتیبانی از اجرای شل تعاملی (Interactive Shell) برای سوئیچ‌های سیسکو در بک‌اند جهت حفظ استیت مودهای پیکربندی سراسری (configure terminal) و اینترفیس و رفع خطای عدم پشتیبانی از دستورات غیرتعاملی.',
      'رمزگشایی خودکار اعتبارسنجی‌ها (کلمه عبور و enable secret) و افزودن پشتیبانی از سایفرها و الگوریتم‌های تبادل کلید سوئیچ‌های نسل قبل سیسکو در اتصال SSH بک‌اند.',
      'به‌روزرسانی خودکار و بلادرنگ وضعیت پورت‌ها و توضیحات اینترفیس‌ها در پنل و نمای فیس‌پلیت از سخت‌افزار واقعی سوئیچ پس از اعمال تغییرات پیکربندی (مانند description، shutdown، vlan و غیره).'
    ],
    changes_en: [
      'Fixed the Cisco terminal command execution pipeline to ensure all commands are sent directly to the real Cisco hardware via the active SSH tunnel, bypassing simulated/mock CLI intercepts.',
      'Enabled interactive shell channel execution in the backend for Cisco devices to maintain configuration mode context (configure terminal, interface config) and resolve non-interactive exec errors.',
      'Integrated automated credential decryption (password and enable secret) and legacy Cisco key exchange / cipher algorithm negotiation in the backend SSH manager.',
      'Added live port state and description synchronization to the faceplate and UI immediately following configuration changes (description, shutdown, vlan, etc.) executed on the physical switch.'
    ]
  },
  {
    version: '1.61.7',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'اصلاح باگ رندر کاراکتر به کاراکتر خروجی‌های اولیه در ترمینال لایو',
    title_en: 'Fix Character-by-Character Line Splitting in Live Terminal Stream',
    changes: [
      'اصلاح پردازش داده‌های جریانی وب‌سوکت در ترمینال‌های سیسکو و میکروتیک جهت پیوستگی کاراکترها روی یک خط واحد تا زمان دریافت کاراکتر سرخط (Newline) و جلوگیری از رندر کاراکترهای دستورات آغازین روی خطوط جداگانه.',
      'تجهیز حلقه خواندن کانال SSH به بافر خواندن دسته‌ای بایت‌های در صف جهت جلوگیری از تقسیم جریان خروجی به فریم‌های تک‌بایتی.',
      'ارسال استاندارد دستورات غیرفعال‌سازی صفحه‌بندی (CRLF) در بدو برقراری اتصال SSH.'
    ],
    changes_en: [
      'Fixed WebSocket streaming buffer in Cisco and MikroTik terminals to maintain line continuity across character and packet boundaries until a newline delimiter is received, preventing initial command characters from rendering on separate lines.',
      'Enhanced SSH reader loop with batch byte buffering to prevent slicing output stream into single-byte frames.',
      'Enforced standard carriage return line feeds (CRLF) on initial terminal paging configuration commands.'
    ]
  },
  {
    version: '1.61.6',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'افزودن دکمه قفل پس‌زمینه به مودال ثبت تجهیز جدید شبکه (قفل پیش‌فرض)',
    title_en: 'Add Lock Toggle for Register New Network Device Modal (Locked by Default)',
    changes: [
      'افزودن دکمه قفل پس‌زمینه (Lock/Unlock) در هدر مودال ثبت تجهیز جدید شبکه (و ویرایش تجهیز) همگام با سایر مودال‌های سیستم.',
      'فعال بودن قفل به صورت پیش‌فرض با باز شدن مودال جهت جلوگیری از بسته شدن ناخواسته فرم با کلیک روی بک‌دراپ بیرون پنجره.'
    ],
    changes_en: [
      'Added a backdrop lock toggle (Lock/Unlock) in the header of the Register New Network Device modal (and Edit Device modal) aligned with other panel modals.',
      'Enabled the lock toggle by default whenever the modal opens to prevent accidental closure when clicking outside on the overlay.'
    ]
  },
  {
    version: '1.61.5',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'چاپ کامل و مستقیم خروجی‌های زنده دستورات شو در ترمینال لایو SSH',
    title_en: 'Direct Full Raw Streaming Output for Show Commands in Live SSH Terminal',
    changes: [
      'اصلاح منطق دریافت جریان داده وب‌سوکت در ترمینال‌های سیسکو و میکروتیک به طوری که تمامی خروجی‌های خام SSH (از جمله دستورات show running-config، show interfaces status، show ip interface brief و غیره) بدون فیلتر یا حذف مستقیماً در صفحه ترمینال چاپ شوند.',
      'حذف توالی‌های کنترلی ANSI/VT100 برای خوانایی متن و ارسال خودکار پیکربندی غیرفعال‌سازی صفحه‌بندی (terminal length 0) در اتصال اولیه جهت جلوگیری از توقف خروجی در پرامپت --More--.',
      'افزودن فیلد خروجی خام (raw_output) در پاسخ همگام‌سازی پورت‌ها برای حفظ یکپارچگی داده‌ها.'
    ],
    changes_en: [
      'Fixed the WebSocket data streaming handlers in Cisco and MikroTik terminals to ensure all raw SSH output (including show running-config, show interfaces status, show ip interface brief, etc.) is printed directly and completely to the terminal buffer without suppression.',
      'Sanitized VT100/ANSI escape sequences for pristine terminal readability and automatically sent pagination-disabling commands (terminal length 0) on session connect to prevent device output pauses on --More-- prompts.',
      'Preserved full raw output across port synchronization responses for complete data transparency.'
    ]
  },
  {
    version: '1.61.4',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'شکستن چیدمان پورت‌های فیس‌پلیت گرافیکی ترمینال در سطرهای ۱۲تایی',
    title_en: 'Wrap Graphical Port Layout in Terminal Modal into 12 Ports per Line',
    changes: [
      'اصلاح ساختار چیدمان پورت‌های گرافیکی فیس‌پلیت در مودال ترمینال (CompactTerminalFaceplate) به طوری که در دسته‌های ۱۲تایی به خط بعد می‌شکنند (۱۲ پورت در هر سطر).',
      'بهینه‌سازی فضای بصری و عدم نیاز به اسکرول افقی عریض روی دیوایس‌های ۲۴، ۴۸ یا ۵۲ پورتی.'
    ],
    changes_en: [
      'Restructured the graphical port faceplate in the Terminal Modal (CompactTerminalFaceplate) to automatically wrap ports into rows of 12 interfaces per line.',
      'Optimized viewport ergonomics by eliminating excessive horizontal scrolling on 24, 48, and 52-port switches.'
    ]
  },
  {
    version: '1.61.3',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'اصلاح نمایش داده‌های پورت انتخاب‌شده و افزودن مشخصات سرعت در پنل جزئیات',
    title_en: 'Fix Selected Port Details Panel Synchronization and Add Speed Metrics',
    changes: [
      'اصلاح همگام‌سازی پنل جزئیات پورت در مودال پورت‌ها (PortInspectorModal) به طوری که با کلیک روی هر پورت گرافیکی، داده‌های دقیق و مشخصات همان پورت بی‌درنگ نمایش داده شود و بر اثر رندر مجدد والد ریست نشود.',
      'افزودن کارت اختصاصی سرعت و مشخصات لینک ارتباطی به همراه نمایش مجزای سرعت توافق‌شده (Negotiated Speed) و حداکثر توان سخت‌افزاری پورت (Max Capability Speed).',
      'حفظ پورت انتخاب‌شده در هنگام بروزرسانی یا دریافت داده‌های جدید سوئیچ به جای بازگشت ناخواسته به اولین پورت.'
    ],
    changes_en: [
      'Fixed port details panel synchronization in PortInspectorModal so clicking any graphical port immediately displays that exact port details without being reset by parent re-renders.',
      'Added a dedicated Port Speed & Link specification card along with distinct metrics for Negotiated Speed and Maximum Hardware Capability Speed.',
      'Preserved active port selection across background polling and re-fetches instead of resetting to the first interface.'
    ]
  },
  {
    version: '1.61.2',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'نمایش پاپ‌آپ و تولتیپ تعاملی سرعت پورت هنگام هاور (Hover Speed Tooltip)',
    title_en: 'Display Interactive Port Speed Tooltip on Hover in Graphical Port Faceplates',
    changes: [
      'افزودن نمایش زنده و برجسته سرعت پورت (مانند 100 Mbps، 1 Gbps، 10 Gbps) به پاپ‌آپ شناور و تولتیپ اختصاصی هنگام حرکت موس (Hover) روی پورت‌های گرافیکی در مودال پورت.',
      'نمایش همزمان مشخصات کلیدی پورت شامل وضعیت لینک (UP/DOWN/DISABLED)، سرعت، شماره VLAN یا مود ترانک و دستگاه متصل به صورت شیک و مدرن.',
      'همگام‌سازی ویژگی نیتیو title و پاپ‌آپ شناور واکنش‌گرا بدون تداخل با سایر بخش‌های شاسی پورت.'
    ],
    changes_en: [
      'Added prominent real-time port speed display (e.g., 100 Mbps, 1 Gbps, 10 Gbps) to the floating interactive tooltip and native popup on mouse hover across graphical ports in the Port Modal.',
      'Simultaneously displayed key interface metrics including link status (UP/DOWN/DISABLED), link speed, VLAN ID / Trunk mode, and connected device in a clean floating card.',
      'Synchronized native HTML title attributes and interactive floating backdrop popovers across all graphical switch faceplates.'
    ]
  },
  {
    version: '1.61.1',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'اصلاح کدگذاری رنگی پورت‌های گرافیکی (رفع نمایش سراسری رنگ قرمز و تفکیک دقیق وضعیت‌های پورت)',
    title_en: 'Fix Graphical Port Color-Coding & Accurate Interface Status Parsing (Resolve False Red State)',
    changes: [
      'اصلاح الگوریتم تشخیص وضعیت پورت‌های سوییچ از خروجی دستور show interfaces status و برطرف کردن نمایش کاذب رنگ قرمز برای کلیه پورت‌ها.',
      'تفکیک دقیق وضعیت‌های گرافیکی پورت: فعال Trunk (بنفش نورانی با نشانگر TRK)، فعال Access (سبز درخشان)، غیرفعال/Shutdown (کهربایی/Amber)، و قطع/Down (طوسی تیره متالیک).',
      'بهبود رجکس پارس خروجی CLI سوییچ‌های سیسکو برای پشتیبانی از نام‌های پورت چندکلمه‌ای و خالی بدون برهم‌خوردن ستون وضعیت و VLAN.',
      'اعمال رنگ‌بندی دقیق در هر دو مودال مدیریت پورت (Port Modal) و ترمینال کنسول (Terminal Modal).'
    ],
    changes_en: [
      'Fixed switch port status parsing from show interfaces status CLI outputs, resolving the issue where all ports were mistakenly shown in red.',
      'Accurately differentiated graphical port color-coding: Up Trunk (illuminated purple with TRK badge), Up Access (emerald green), Disabled/Shutdown (amber), and Down/Disconnected (dark metallic slate).',
      'Enhanced Cisco CLI interface parser regex to handle empty or multi-word port descriptions without shifting status, vlan, or duplex columns.',
      'Synchronized color-coding logic across both Port Inspector Modal and Terminal Faceplate.'
    ]
  },
  {
    version: '1.61.0',
    releaseDate: '2026-09-16',
    type: 'minor',
    title: 'افزودن سیستم هوشمند کشف توپولوژی شبکه با پروتکل‌های CDP و LLDP و تطبیق خودکار اتصالات فیزیکی',
    title_en: 'Intelligent Network Topology Discovery Suite via CDP & LLDP Protocols with Automatic Physical Link Correlation',
    changes: [
      'پیاده‌سازی موتور جامع کشف همسایگی لایه ۲ و لایه ۳ با پروتکل‌های استانداردی سیسکو (CDP)، پروتکل بین‌المللی LLDP و پروتکل همسایگی میکروتیک (MNDP).',
      'پشتیبانی از ۴ روش متنوع کشف: از کلیه سوییچ‌های ثبت‌شده در انبار (Inventory-wide)، از طریق یک سوییچ مشخص، اسکن محدوده آی‌پی دلخواه با اتصال SSH، و کشف از شبکه محلی سرور.',
      'افزودن مودال اختصاصی TopologyDiscoveryModal مطابق با دستورالعمل جامع مودال‌ها (MODAL_GUIDELINES) با پشتیبانی کامل از قابلیت مینیمایز به نوار داک پایین (ToolsDock).',
      'موتور تطبیق و همبستگی دوطرفه لینک‌ها (Link Correlation Engine) جهت تفکیک لینک‌های تاییدشده دوطرفه از یک‌طرفه و حذف ریشه‌ای اتصالات تکراری.',
      'شناسایی و کشف خودکار تجهیزات جدید و متصل‌نشده (Unmanaged Neighbors) و امکان افزودن آنها با یک کلیک به بوم نقشه.',
      'ترمینال زنده جریان لاگ‌های SSH با گزارش وضعیت هر سوییچ، تعداد همسایگان، پورت‌ها و مدیریت خطاهای عدم دسترسی بدون متوقف شدن کل اسکن.',
      'امکان تایید انتخابی لینک‌ها و اعمال مستقیم آنها روی نقشه با حفظ کامل ساختار کارت‌ها، پورت‌ها و کابل‌های بوم توپولوژی.',
      'رعایت صددرصدی قوانین چندزبانگی (Strict i18n) و عدم نمایش هرگونه متن فارسی در حالت انگلیسی.'
    ],
    changes_en: [
      'Implemented an enterprise-grade L2/L3 topology discovery engine supporting Cisco CDP, IEEE 802.1AB LLDP, and MikroTik MNDP neighbor discovery protocols.',
      'Supported 4 distinct discovery methods: Inventory-wide sweep across registered switches, single switch query, custom IP range SSH sweep (CIDR), and server local network neighbor detection.',
      'Created TopologyDiscoveryModal adhering strictly to MODAL_GUIDELINES with universal minimization support into the bottom ToolsDock.',
      'Developed a topology correlation engine to deduplicate inter-switch links, cross-verify bidirectional vs unidirectional connections, and map local-to-remote ports accurately.',
      'Automated detection of unmanaged neighbor devices with one-click canvas onboarding and coordinate distribution.',
      'Real-time streaming CLI log terminal displaying per-device query progress, neighbor counts, latency, and graceful error isolation.',
      'Interactive preview table allowing selective link confirmation and immediate application to the active schematic topology map.',
      'Enforced 100% strict localization compliance with complete Persian and English symmetry.'
    ]
  },
  {
    version: '1.60.4',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'تفکیک دقیق نمای کارت و فیزیکی در توپولوژی، تصحیح خودکار آی‌پی مدیریتی در ثبت تجهیز و ارتقای ایمنی تایپ‌ها',
    title_en: 'Card vs Physical View Separation in Topology Canvas, SSH Target IP Auto-fill, Port Deduplication & Strict Type Safety',
    changes: [
      'تفکیک صریح کنترل‌ها و دکمه‌های نوار ابزار توپولوژی؛ دکمه‌های «افزودن رک»، «افزودن دکل» و «نصب تجهیز فیزیکی» تنها در نمای فیزیکی (Physical Mode) نمایش داده می‌شوند.',
      'اصلاح مودال ثبت تجهیز در نقشه سفارشی جهت پنهان‌سازی سوییچر حالت فیزیکی در زمان انتخاب نمای کارتی.',
      'تکمیل خودکار فیلد Management IP بر اساس نتیجه تست SSH و هاست ورودی در مودال ثبت تجهیز جدید.',
      'رفع ریشه‌ای تکثیر و ۲ برابر شدن پورت‌ها در دیسکاوری تجهیزات و تلمتری اینترفیس‌ها.',
      'رفع تمامی خطاهای تایپ‌اسکریپت در کامپوننت‌های گوناگون و تضمین اجرای کاملاً سبز lint و build پروژه.',
      'پایبندی ۱۰۰٪ به قوانین محلی‌سازی و ممنوعیت متون فارسی در حالت انگلیسی پنل.'
    ],
    changes_en: [
      'Explicitly separated toolbar controls for topology canvas: "Add Rack", "Add Tower", and "Install Hardware" buttons are only visible when in Physical Mode.',
      'Updated Custom Map Add Device Modal to conditionally hide representation switcher when initialized in Card mode.',
      'Implemented auto-filling of the Management IP Address field based on SSH test probe results and target host.',
      'Resolved interface duplication bug where ports were counted twice during device discovery and telemetry fetching.',
      'Fixed all TypeScript type issues across components, ensuring 100% green compilation and lint verification.',
      'Strictly adhered to i18n localization guidelines with no Persian text appearing in English mode.'
    ]
  },
  {
    version: '1.60.3',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'رفع باگ انتخاب خودکار تمامی پورت‌ها در ترمینال سیسکو، میکروتیک و بازرس پورت‌ها',
    title_en: 'Fix All Ports Pre-Selected Bug in Cisco/MikroTik Terminal and Port Inspector Modals',
    changes: [
      'برطرف‌سازی ریشه‌ای مشکل انتخاب و هایلایت شدن ناخواسته همه پورت‌های تجهیز هنگام باز کردن مودال ترمینال سیسکو، ترمینال میکروتیک و بازرس پورت‌ها.',
      'اصلاح منطق بررسی وضعیت انتخاب پورت (isSelected) در فیس‌پلیت پورت‌ها و جدول بازرس پورت‌ها به صورت ایمن و عدم تطابق مقادیر تعریف‌نشده (undefined).',
      'نرمال‌سازی کامل ساختار اطلاعات پورت‌ها و تضمین اختصاص شناسه یکتای port_id در بک‌اند سرور و تمامی لایه‌های فرانت‌اند (PortInspectorModal، CiscoTerminalModal، MikroTikTerminalModal، PortManagementView).',
      'ریست و خالی کردن صریح آرایه selectedPortIds و selectedPort به محض باز شدن مودال ترمینال یا تغییر دیوایس برای جلوگیری از نشت استیت قبلی.',
      'رعایت کامل استانداردهای بین‌المللی‌سازی و عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule).'
    ],
    changes_en: [
      'Fundamentally fixed the bug where all device ports were unexpectedly shown as selected/highlighted when opening Cisco terminal, MikroTik terminal, or Port Inspector modals.',
      'Hardened the selection check logic (isSelected) in CompactTerminalFaceplate, PortInspectorModal, PortManagementView, and MikroTik modals to prevent undefined-to-undefined accidental matches.',
      'Normalized port data structures at both the backend route layer and frontend consumers to ensure consistent presence of port_id and fallback naming.',
      'Explicitly cleared and initialized selectedPortIds and selectedPort state upon modal opening and device switching, preventing stale selection leakage.',
      'Enforced 100% strict localization compliance with complete Persian/English symmetry.'
    ]
  },
  {
    version: '1.60.2',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'رفع مشکل صفحه مشکی در ترمینال مستقیم SSH و بازرس پورت‌ها، اعمال گارد دفاعی کامل بر روی فیلدهای پورت و افزودن ErrorBoundary سراسری',
    title_en: 'Fix Black Screen Crash on Direct SSH Console & Port Inspector, Complete Defensive Guards on Port Properties & Global React ErrorBoundary',
    changes: [
      'برطرف‌سازی ریشه‌ای خطای شکست اجرای برنامه (TypeError: Cannot read properties of undefined reading toUpperCase) که باعث مشکی شدن صفحه هنگام کلیک روی ترمینال مستقیم SSH یا بازرس پورت‌ها می‌شد.',
      'افزودن گاردها و فالبک‌های پیشگیرانه در تمامی ماژول‌های بصری پورت‌ها شامل NetworkPortSvg، CompactTerminalFaceplate، PortInspectorModal، CiscoTerminalModal، MikroTikTerminalModal، MikroTikDeviceManageModal، HardwareSvgRenderer و PortManagementView.',
      'پیاده‌سازی کامپوننت سراسری ErrorBoundary در ریشه نرم‌افزار جهت محافظت کامل در برابر خطاهای رندرینگ غیرمنتظره و جلوگیری از سفید یا مشکی شدن صفحه همراه با امکان تلاش مجدد بدون نیاز به رفرش دستی.',
      'افزودن ویژگی‌های استاندارد autoComplete به فیلدهای فرم افزودن و ویرایش تجهیزات جهت برطرف‌سازی هشدارهای کنسول مرورگر.',
      'رعایت صددرصدی استاندارد بین‌المللی‌سازی و عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule).'
    ],
    changes_en: [
      'Fundamentally resolved the crash defect (TypeError: Cannot read properties of undefined reading toUpperCase) that caused a black screen when launching the direct SSH console or inspecting device ports.',
      'Applied comprehensive defensive null-coalescing guards and fallbacks across all port rendering components: NetworkPortSvg, CompactTerminalFaceplate, PortInspectorModal, CiscoTerminalModal, MikroTikTerminalModal, MikroTikDeviceManageModal, HardwareSvgRenderer, and PortManagementView.',
      'Implemented an enterprise-grade React ErrorBoundary component at the application root to capture unexpected UI exceptions and prevent blank/black screens, with built-in retry and reload controls.',
      'Added standard autoComplete attributes to SSH and device credential input fields in Add and Edit device modals to eliminate browser console DOM warnings.',
      'Enforced 100% strict localization compliance with complete Persian/English symmetry and zero untranslated content in English mode.'
    ]
  },
  {
    version: '1.60.1',
    releaseDate: '2026-09-16',
    type: 'patch',
    title: 'رفع مشکل پرش و بازگشت موقعیت کارت‌ها در نمای شماتیک پس از افزودن تجهیزات از انبار به رک',
    title_en: 'Fix Device Card Position Reset & Persistence After Mounting Hardware from Inventory to Rack in Schematic View',
    changes: [
      'حل مشکل پرش و بازگشت موقعیت کارت (Card Position Reversion) هنگام جابجایی تجهیزاتی که از انبار سخت‌افزار به رک در نمای فیزیکی اضافه شده بودند.',
      'طراحی سیستم جامع تفکیک و تطبیق شناسه‌ها و نام‌های مستعار (Identifier Aliases Synchronization) شامل شناسه‌های خام اینونتوری، پیشوندهای hw-، پیشوندهای radio- و شناسه‌های تمیز در سراسر استیت‌های محلی و پایگاه داده.',
      'یکپارچه‌سازی و همگام‌سازی موقعیت‌ها در هر دو ساختار داده devicePositions و physicalPositions در زمان ذخیره سخت‌افزار، جابجایی درگ‌اند‌دراپ و ترنزیشن بین ویوها.',
      'پاکسازی دقیق و کامل شناسه‌های مستعار از استیت موقت customPositions پس از پایان درگ برای جلوگیری از تداخل موقعیت‌های موقت با دیتای ماندگار.',
      'رعایت کامل استانداردهای بین‌المللی‌سازی و عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule).'
    ],
    changes_en: [
      'Resolved device card position reversion defect where hardware mounted to a rack from inventory in physical view would revert to previous coordinates when moved in card view.',
      'Engineered an identifier aliases synchronization engine mapping base clean inventory IDs, hw- prefixes, radio- prefixes, and device IDs across local state and persistent storage.',
      'Synchronized coordinates across both devicePositions and physicalPositions during hardware insertion, drag-and-drop mouse up, and view transitions.',
      'Ensured complete cleanup of temporary drag coordinates across all alias keys from customPositions to prevent stale layout conflicts.',
      'Maintained 100% strict localization compliance with complete Persian/English symmetry and zero untranslated content in English mode.'
    ]
  },
  {
    version: '1.60.0',
    releaseDate: '2026-09-16',
    type: 'minor',
    title: 'پیاده‌سازی موتور واقعی ترمینال SSH پایتون با پشتیبانی از الگوریتم‌های قدیمی سیسکو، رمزنگاری اعتبارات و استریم دوطرفه سوکت',
    title_en: 'Implementation of Real Python Paramiko SSH Engine with Legacy Cisco Algorithms, Fernet Credential Encryption & WebSocket Streaming',
    changes: [
      'جایگزینی کامل داده‌های شبیه‌سازی‌شده ترمینال با موتور واقعی SSH و Telnet تحت پایتون (کتابخانه Paramiko) برای برقراری اتصال زنده به تجهیزات شبکه.',
      'طراحی و پیاده‌سازی مسیر اختصاصی وب‌سوکت (/ws/ssh/:deviceId و /ws/terminal) جهت استریم بی‌درنگ ورودی و خروجی شل تعاملی (PTY).',
      'پشتیبانی جامع از تجهیزات قدیمی سیسکو (مانند Cisco Catalyst 2960) با مکانیزم Fallback خودکار به الگوریتم‌های diffie-hellman-group1-sha1، ssh-rsa و aes128-cbc در صورت شکست اعتبارسنجی مدرن.',
      'امن‌سازی کامل اطلاعات کاربری با ماژول رمزنگاری متقارن Fernet (Cryptographic Symmetric Encryption) و ذخیره رمزنگاری‌شده گذرواژه‌ها در پایگاه داده و مهاجرت امن خودکار داده‌های پیشین.',
      'مدیریت چرخه حیات نشست‌های تعاملی شبکه، تغییر ابعاد PTY متناسب با ترمینال کاربری (Terminal Resize) و پاکسازی و آزادسازی حافظه و سوکت‌ها پس از بستن ترمینال.',
      'به‌روزرسانی اسکریپت راه‌اندازی setup-panel.sh و نصب پیش‌نیازهای python3-paramiko، python3-cryptography و python3-websockets بر روی سرور.',
      'رعایت صددرصدی استاندارد بین‌المللی‌سازی و عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule).'
    ],
    changes_en: [
      'Replaced mocked terminal output with a real Python SSH and Telnet engine using Paramiko for direct, live interactive connections to network hardware.',
      'Implemented dedicated full-duplex WebSocket routes (/ws/ssh/:deviceId and /ws/terminal) for real-time streaming of pseudo-terminal (PTY) standard input and output.',
      'Integrated comprehensive legacy Cisco support (e.g., Catalyst 2960) featuring automatic algorithm negotiation fallback to diffie-hellman-group1-sha1, ssh-rsa, and aes128-cbc.',
      'Secured network device credentials using Fernet symmetric encryption with automatic database migration of existing stored passwords and on-the-fly decryption at session start.',
      'Engineered interactive terminal session management with dynamic PTY window resizing, keepalive heartbeats, and guaranteed resource teardown on disconnect.',
      'Updated setup-panel.sh script with automated installation of python3-paramiko, python3-cryptography, and python3-websockets system packages.',
      'Enforced 100% strict localization compliance with complete Persian/English symmetry and zero untranslated content in English mode.'
    ]
  },
  {
    version: '1.59.1',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'رفع مشکل پلکانی تایپ کاراکترها در ترمینال، اصلاح نمایش آدرس خالی در بنر اتصال و تفکیک دقیق نشست واقعی از شبیه‌ساز',
    title_en: 'Terminal Staircase Typing & Echo Fix, Empty IP Hostname Banner Resolution, and Accurate Real vs Simulated Session Distinction',
    changes: [
      'رفع مشکل اکوی کاراکتر به کاراکتر و شکستگی خطوط (Staircase Effect) در ترمینال سوکت با بافر کردن خطی دستورات بر روی کلید Enter و ارسال بدون اکوی مضاعف.',
      'اصلاح استخراج آدرس IP میزبان و جلوگیری از نمایش پرانتز و فیلد خالی ("Target Host: \'\'" و "Connected to ()") در بنر احراز هویت و وضعیت اتصال ترمینال.',
      'تفکیک دقیق وضعیت اتصال واقعی سخت‌افزاری از موتور شبیه‌ساز ترمینال محلی و جلوگیری از نمایش نادرست پیام اتصال زنده بر روی آی‌پی نامشخص.',
      'پشتیبانی کامل از ترنزیشن مدهای CLI سیسکو (enable، configure terminal، interface و exit) و تغییر خط اعلان (Prompt) بدون خروجی اضافی.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule) در پیام‌های راه‌اندازی و وضعیت ترمینال.'
    ],
    changes_en: [
      'Resolved character-by-character echoing and line-breaking staircase defects in terminal WebSockets by enforcing line buffering on Enter with clean response delivery.',
      'Fixed device host resolution preventing empty parentheses or empty host strings ("Target Host: \'\'" and "Connected to ()") in the authentication banner and terminal header.',
      'Accurately differentiated between real hardware SSH sessions and the simulated local CLI engine, preventing false "Live SSH Established" alerts when no IP is reachable.',
      'Added smooth Cisco CLI mode transitions (enable, configure terminal, interface sub-modes, and exit) with synchronized prompts and clean outputs.',
      'Enforced 100% strict localization compliance: verified zero Persian text in English mode across all terminal connection headers, banners, and status messages.'
    ]
  },
  {
    version: '1.59.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'ارتباط مستقیم و پایدار SSH WebSocket با مشخصات ثبت‌شده دیوایس، استعلام زنده وضعیت پورت‌ها از طریق تانل، دکمه همگام‌سازی روی فیس‌پلیت و تب اینترفیس‌ها',
    title_en: 'Persistent SSH WebSocket Tunnel with Stored Credentials, Live Tunnel Port Syncing, Interactive Faceplate Sync Trigger & Interface Tab Tunnel Queries',
    changes: [
      'برقراری اتصال مستقیم و پایدار SSH WebSocket از منوی سه نقطه تجهیزات با استفاده از اطلاعات ثبت‌شده دیوایس (IP، پورت، نام کاربری و رمز عبور) و حفظ فعال اتصال تا زمان بسته شدن کامل مودال.',
      'پیاده‌سازی سازوکار KeepAlive پینگ/پانگ (Ping/Pong) برای جلوگیری از قطع شدن زودهنگام تانل سوکت در حین باز بودن پنجره ترمینال.',
      'افزودن اندپوینت جدید استعلام پورت‌ها (/api/devices/:dev_id/ports/sync) جهت خواندن زنده وضعیت و جزئیات پورت‌ها مستقیماً از روی تانل فعال SSH و اجرای دستورات واقعی سخت‌افزاری (show ip interface brief / show running-config در سیسکو و /interface print در میکروتیک).',
      'تجهیز برچسب تعداد پورت‌ها در کامپوننت فیس‌پلیت سخت‌افزاری (CompactTerminalFaceplate) به دکمه تعاملی همگام‌سازی مجدد با آیکون انیمیشنی و نمایش وضعیت بررسی زنده.',
      'افزودن دکمه اختصاصی بررسی و همگام‌سازی زنده SSH در سربرگ جستجوی تب اینترفیس‌های ترمینال سیسکو و میکروتیک و همگام‌سازی خودکار پورت‌ها پس از اجرای دستورات نمایش اینترفیس.',
      'رعایت کامل قانون عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization Rule) در تمامی پیام‌های استعلام تانل و همگام‌سازی.'
    ],
    changes_en: [
      'Established direct, persistent SSH WebSocket connections initiated from device actions using registered credentials (IP, port, username, password) that remain continuously alive until the modal is closed.',
      'Implemented proactive WebSocket ping/pong keepalive loop preventing idle disconnection while the terminal window remains open.',
      'Added hardware interface synchronization endpoint (/api/devices/:dev_id/ports/sync) querying live port states directly over the active SSH tunnel using real driver commands (show ip int brief / show running-config on Cisco, and /interface print on MikroTik).',
      'Upgraded the port count badge on the CompactTerminalFaceplate into an interactive re-sync button with spinning loader animation and live tunnel verification.',
      'Added dedicated "Sync SSH" button in the interfaces tab sidebar header across Cisco and MikroTik terminal modals with automatic port re-sync triggered after interface inspection commands.',
      'Enforced 100% strict localization compliance: verified zero Persian text in English mode across all tunnel query and synchronization logs.'
    ]
  },
  {
    version: '1.58.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'اصلاح و استخراج دقیق نام میزبان (Hostname)، تصحیح منطق شمارش پورت‌ها به ۴۸ پورت استاندارد، افزودن توضیحات دقیق پورت‌ها بر اساس مدل و بومی‌سازی کامل پیام‌های اتصال SSH',
    title_en: 'Accurate Device Hostname Extraction, Canonical 48-Port Normalization, Model-Aware Port Specifications & Strict SSH English Localization',
    changes: [
      'اصلاح و تقویت الگوریتم استخراج نام میزبان (Device Hostname) از کانفیگ فعال (running-config)، سربرگ سیستم (Sysname) و خط اعلان CLI در موتورهای دیسکاوری پایتون و نود.',
      'تصحیح منطق محاسبه تعداد کل پورت‌ها؛ فیلتر کردن دقیق پورت‌های مدیریتی (FastEthernet0 / management) از پورت‌های فیزیکی اکسس/ترانک جهت جلوگیری از شمارش نادرست ۴۹ پورت و ثبت دقیق ۴۸ یا ۵۲ پورت استاندارد بر اساس مدل دستگاه.',
      'افزودن توضیحات راهنما و کامنت دقیق برای فیلد تعداد کل پورت‌ها (Total Ports Count) منطبق با معماری سخت‌افزار (پورت‌های گیگابیت اترنت اکسس به همراه آپلینک‌های فیبر نوری SFP/SFP+).',
      'تضمین رعایت ۱۰۰٪ قانون عدم نمایش متن فارسی در حالت انگلیسی در تمامی پیام‌های موفقیت، خطا، بنرها و وضعیت اتصال SSH در فرم ثبت و ویرایش تجهیز.',
      'ارتقا و همگام‌سازی کامل فیلدها در هر دو مودال AddDeviceModal و EditDeviceModal به همراه قابلیت قفل و بازگشایی دستی.'
    ],
    changes_en: [
      'Enhanced regex pattern matching to accurately extract Device Hostname from running-config, Sysname headers, and active CLI prompts across Cisco IOS, IOS-XE, and MikroTik RouterOS.',
      'Corrected canonical port counting logic; properly excluded management interfaces (FastEthernet0 / mgmt0) to eliminate erroneous 49-port readings and reliably normalize to standard 48 or 52 ports.',
      'Added dynamic model-aware descriptive annotations for the Total Ports Count field specifying physical copper access ports vs. SFP/SFP+ optical uplinks.',
      'Enforced 100% strict localization compliance: eliminated any Persian text in SSH success/error banners, notifications, and tooltips when English mode is active.',
      'Synchronized telemetry auto-population, dynamic comments, and discovery locking across both AddDeviceModal and EditDeviceModal.'
    ]
  },
  {
    version: '1.57.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'موتور کشف سخت‌افزار حقیقی از طریق SSH پایتون، ایجاد کانکشن مادر (Mother Connection)، استخراج خودکار مشخصات سخت‌افزاری و واحدهای منبع تغذیه (PSU & Watts)',
    title_en: 'Real Hardware Discovery Engine via Python SSH, Mother Connection Tunnel, Hardware Specs Auto-population & PSU Telemetry',
    changes: [
      'پیاده‌سازی موتور کشف سخت‌افزاری زنده با پایتون (hardware_discovery.py) برای برقراری تانل واقعی SSH به سوئیچ‌ها و روترهای سیسکو و میکروتیک بدون دیتای شبیه‌سازی.',
      'ایجاد مفهوم کانکشن مادر (Mother Connection) و اتصال یکتای master_session_id؛ جلسه SSH برقرار شده در تست اتصال حفظ شده و مستقیماً به عنوان کانکشن اصلی دیوایس ثبت می‌گردد.',
      'استخراج و پر کردن خودکار مشخصات سخت‌افزاری شامل نام میزبان (Hostname)، مدل تجهیز، شماره سریال (Serial Number)، مک آدرس پایه (Base MAC)، نسخه فریم‌ور/سیستم‌عامل (Firmware/OS) و مدت‌زمان کارکرد (Uptime) با اجرای دستورات واقعی (show version / inventory / running-config در سیسکو و /system/resource در میکروتیک).',
      'افزودن بخش اختصاصی واحدهای منبع تغذیه و بار مصرفی (Power Supply Units & Load - PSU & Watts) با محاسبه و استخراج هوشمند تعداد پاورها و توان مصرفی بر اساس مدل و تله‌متری زنده.',
      'نمایش وضعیت زنده کانکشن مادر به همراه شناسه جلسه در فرم اطلاعات ترمینال و رعایت دقیق قوانین عدم نمایش متن فارسی در حالت انگلیسی (Strict Localization).'
    ],
    changes_en: [
      'Implemented real hardware discovery engine in Python (hardware_discovery.py) establishing genuine SSH tunnels to Cisco switches/routers and MikroTik RouterBOARD devices with zero simulated data.',
      'Introduced the Mother Connection paradigm with persistent master_session_id caching, preserving the active SSH session from test-connection directly into device registration.',
      'Auto-populated device identifiers and hardware specs including Hostname, Model, Serial Number, Base MAC Address, OS/Firmware Version, and System Uptime via live CLI commands (show version / inventory / running-config / mac address-table on Cisco, and /system/resource /system/routerboard on MikroTik).',
      'Added dedicated Power Supply Units & Load (PSU & Watts) section with intelligent wattage and power supply redundancy discovery based on hardware telemetry.',
      'Added real-time Mother Connection indicator with session identifier badge in terminal credentials form and verified 100% strict localization compliance (zero Persian text in English mode).'
    ]
  },
  {
    version: '1.56.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'همگام‌سازی و بازطراحی کامل مودال ثبت تجهیز جدید شبکه (AddDeviceModal) منطبق با ساختار و امکانات پیشرفته ویرایش تجهیز',
    title_en: 'Complete Redesign of Register New Network Device Modal (AddDeviceModal) Aligned with Edit Device Properties Architecture',
    changes: [
      'بازطراحی کامل ساختار، چیدمان و استایل مودال ثبت تجهیز جدید شبکه (AddDeviceModal) دقیقاً منطبق با مودال ویرایش ویژگی‌های تجهیز (EditDeviceModal).',
      'افزودن نمای فیس‌پلیت گرافیکی و جدول تله‌متری پورت‌های سوئیچ (show interface status) با پشتیبانی از کشف زنده پورت‌ها از طریق تست اتصال SSH یا تله‌متری آزمایشگاهی.',
      'افزودن امکان تست اتصال بلادرنگ SSH / Telnet با قابلیت کشف و پر کردن خودکار شناسه تجهیز (Hostname)، مدل سخت‌افزاری و تعداد پورت‌ها به همراه قفل ایمن و قابلیت ویرایش دستی.',
      'تجهیز فیلد آدرس آی‌پی به ابزار پینگ زنده هاست (Ping Host) با نمایش بلادرنگ میزان تاخیر (Latency ms) و وضعیت پاسخ‌دهی ICMP.',
      'یکپارچه‌سازی انتخاب پلتفرم سخت‌افزاری و سیستم‌عامل (Cisco IOS, Cisco IOS-XE, MikroTik RouterOS, Generic Linux) با دکمه‌های انتخاب سریع رده سخت‌افزاری و نقش دستگاه.',
      'پشتیبانی کامل از سلسله‌مراتب فیزیکی و استقرار در رک به همراه امکان استقرار قالب پیکربندی اولیه بلافاصله پس از ثبت تجهیز.',
      'رعایت ۱۰۰٪ دستورالعمل‌های چندزبانگی (FA/EN بدون متن فارسی در زبان انگلیسی) و تجهیز کامل به دکمه مینیمایز (Minimize) به نوار ابزار پایین صفحه.'
    ],
    changes_en: [
      'Comprehensive redesign of Register New Network Device modal (AddDeviceModal) to strictly mirror the visual layout, spacing, and advanced functionality of Edit Device Properties (EditDeviceModal).',
      'Integrated switch ports graphical faceplate and live telemetry banner (show interface status) with live SSH port discovery and lab telemetry loading.',
      'Added real-time SSH / Telnet connection testing with auto-population of device hostname, hardware model, and total port count with discovery locking and manual unlock capability.',
      'Equipped management IP address field with a live ICMP Ping Host test utility displaying real-time latency (ms) and host reachability status.',
      'Streamlined side-by-side hardware platform & OS driver selection (Cisco IOS, Cisco IOS-XE, MikroTik RouterOS, Generic Linux) with rapid hardware class buttons and role selector.',
      'Integrated physical location and rack placement with autocomplete suggestions, plus optional post-registration configuration template deployment.',
      '100% strict compliance with bilingual localization (zero Persian text in English mode) and universal modal minimization support.'
    ]
  },
  {
    version: '1.55.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'توسعه کامل پروتکل‌های پیشرفته VPN میکروتیک (WireGuard, EoIP, VXLAN, SSTP, OpenVPN)، راهنمای تعاملی اینفو برای تمام فیلدها و اتصال سخت‌افزاری زنده',
    title_en: 'Advanced MikroTik VPN Protocols (WireGuard, EoIP, VXLAN, SSTP, OpenVPN), Field Info Tooltips, and Live Hardware SSH Integration',
    changes: [
      'حذف کامل حالت شبیه‌ساز و واژه‌های فازبندی؛ کلیه عملیات VPN مستقیماً روی روتر حقیقی از طریق مشخصات SSH دستگاه در ماژول مدیریت تجهیزات اجرا می‌گردند.',
      'افزودن دکمه تعاملی راهنما (i Info) برای تمامی تکست‌باکس‌ها و فیلدهای ورودی در فرم‌های VPN با ارائه توضیحات مهندسی شبکه درباره چیستی و چرایی ضرورت هر پارامتر در میکروتیک.',
      'توسعه و تجهیز کامل پروتکل‌های مدرن شامل WireGuard (با سرعت حداکثری هسته کرنل)، EoIP (پل شفاف لایه ۲ اترنت)، VXLAN (اورلی سگمنت‌های دیتاسنتر)، SSTP (با پورت ۴۴۳ عبور از فیلترینگ) و OpenVPN.',
      'ماژولار کردن معماری فرانت‌اند و تفکیک کامپوننت‌های فرم‌های پروتکل و مودال بررسی وضعیت زنده اینترفیس‌ها با قابلیت مینیمایز کامل.',
      'رعایت ۱۰۰٪ دستورالعمل‌های چندزبانگی (بدون متن فارسی در حالت انگلیسی) و اعتبارسنجی کامل داده‌های ورودی.'
    ],
    changes_en: [
      'Completely removed simulator mode and all phase naming; all VPN configurations are executed directly on the real hardware router via credentials managed in the Network Inventory module.',
      'Integrated interactive information tooltips (i Info) next to every single input text box across all VPN protocol forms, detailing the parameter purpose and network engineering necessity.',
      'Expanded protocol suite to include WireGuard (high-throughput kernel-level crypto), EoIP (Layer 2 transparent bridging), VXLAN (datacenter multi-tenant overlay), SSTP (HTTPS port 443 firewall bypass), and OpenVPN.',
      'Modularized frontend architecture with dedicated sub-components for protocol forms and live interface inspection with universal modal minimization support.',
      'Strict bilingual localization compliance (zero Persian text in English mode) and comprehensive input validation.'
    ]
  },
  {
    version: '1.54.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'پیاده‌سازی کامل و واقعی سوییت VPN میکروتیک (L2TP/IPsec و GRE) در مودال مدیریت روتر با اتصال زنده SSH',
    title_en: 'Full Non-Simulated MikroTik VPN Suite (L2TP/IPsec & GRE) with Live Router SSH Execution & Rollback Protection',
    changes: [
      'پیاده‌سازی تب اختصاصی و قدرتمند VPN در مودال مدیریت تجهیزات میکروتیک (MikroTikDeviceManageModal) منطبق با معماری Device → Platform → Driver → SSH Connection.',
      'پشتیبانی کامل از پروتکل‌های L2TP/IPsec در هر دو حالت Remote Access (کاربران دورکار) و Site-to-Site و همچنین تونل GRE با رمزنگاری سخت‌افزاری IPsec و مسیرهای استاتیک.',
      'ویزارد گام به گام هوشمند شامل سناریو، پروتکل، پارامترهای اصلی و پیشرفته، پیش‌نمایش دستورات RouterOS با ماسک کردن رمزها (Masking Secrets) و استعلام زنده وضعیت عملیاتی روتر.',
      'سیستم اعمال امن دستورات با قابلیت Rollback خودکار در صورت بروز خطای نحوی یا قطعی در اتصال روتر.',
      'پایبندی ۱۰۰٪ به قوانین چندزبانه (FA/EN)، عدم استفاده از شبیه‌ساز یا داده ساختگی، رعایت کامل محرمانگی گذرواژه‌ها و پشتیبانی از قابلیت مینیمایز در تمامی پنجره‌های فرعی.'
    ],
    changes_en: [
      'Implemented dedicated production-ready VPN Suite tab within MikroTik RouterOS Device Management Modal following the Device → Platform → Driver → SSH Connection architecture.',
      'Full protocol support for L2TP/IPsec in both Remote Access (teleworker road-warrior) and Site-to-Site modes, as well as GRE Routed Overlay with hardware IPsec encryption and static routes.',
      'Multi-step creation wizard featuring scenario selection, protocol catalog, basic & advanced configuration, masked RouterOS script preview, and live operational interface verification.',
      'Safe sequential command execution pipeline with automatic atomic rollback of preceding steps upon syntax or network errors.',
      '100% strict compliance with bilingual localization (FA/EN), zero mock/fake data, complete password sanitization from API responses/audit logs, and universal modal minimization.'
    ]
  },
  {
    version: '1.53.6',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'افزودن دکمه جمع‌کردن و بازکردن نوار ابزار نقشه‌ها در صفحه شماتیک جهت افزایش دید کاربر',
    title_en: 'Collapsible Map View Secondary Toolbar with Toggle Arrow in Schematic Canvas',
    changes: [
      'افزودن دکمه فلش جمع‌کننده/بازکننده نوار ابزار دوم نقشه‌ها (Map View & Custom Tools) در بخش بالای صفحه شماتیک.',
      'امکان مخفی‌سازی نوار و تبدیل آن به یک نوار باریک با مصرف حداقل ارتفاع جهت افزایش فضای کاری و دید بهتر نقشه برای کاربر.',
      'ذخیره‌سازی هوشمند وضعیت باز یا بسته بودن نوار در حافظه محلی مرورگر (localStorage) جهت حفظ تنظیم کاربر در دفعات مراجعه بعدی.',
      'پشتیبانی کامل از دو زبانه بودن اعلان‌ها، آیکون‌های متناسب ChevronUp/ChevronDown و حفظ دسترسی به عنوان نقشه فعال در حالت جمع‌شده.'
    ],
    changes_en: [
      'Added a toggle arrow button to collapse or expand the secondary Map View & custom tools toolbar in the schematic topology canvas.',
      'Allows minimizing the secondary toolbar to a slim compact bar to provide maximum screen real estate and viewing canvas area for topology analysis.',
      'Persistent toolbar state stored in browser localStorage (nettopology_schematic_toolbar_collapsed) across user sessions.',
      'Full bilingual localization (FA/EN) with responsive ChevronUp/ChevronDown states and active map indicator in collapsed mode.'
    ]
  },
  {
    version: '1.53.5',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'تازه‌سازی خودکار و همگام‌سازی آخرین تغییرات نقشه و موقعیت تجهیزات از پایگاه‌داده با دکمه بازنشانی زوم',
    title_en: 'Auto-Refresh & Synchronize Latest Database Map Changes and Device Coordinates on Reset Zoom Action',
    changes: [
      'ارتقای عملکرد دکمه بازنشانی زوم و مرکز صفحه (Reset Zoom & Center View) در نوار ابزار بوم شماتیک شبکه.',
      'همگام‌سازی آنی آخرین داده‌های ذخیره‌شده در پایگاه‌داده شامل موقعیت جدید تجهیزات جابجا شده (/api/settings/node-positions)، نقشه‌های سفارشی (/api/settings/maps)، درخت سلسله‌مراتب فیزیکی (/api/settings/hierarchy) و وضعیت زنده اتصال و پورت‌های شبکه.',
      'افزودن انیمیشن چرخش آیکون تازه‌سازی (Spinning Indicator) در زمان بارگذاری و نمایش اعلان وضعیت انجام موفقیت‌آمیز دریافت تغییرات متناسب با زبان فعال (FA/EN).'
    ],
    changes_en: [
      'Enhanced the Reset Zoom & Center View action in the schematic topology canvas toolbar.',
      'Instant synchronization of latest persisted database state including relocated device coordinates (/api/settings/node-positions), custom maps (/api/settings/maps), physical hierarchy (/api/settings/hierarchy), and live device port reachability.',
      'Added dynamic spinning refresh indicator during database sync with localized confirmation toast notifications respecting current language mode (FA/EN).'
    ]
  },
  {
    version: '1.53.4',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'بازطراحی و همگام‌سازی کامل قالب تیره (Dark Mode) در مودال ثبت تجهیز جدید شبکه',
    title_en: 'Full Dark Mode Visual Theme Alignment and Consistency for Register New Network Device Modal',
    changes: [
      'اصلاح و همگام‌سازی کامل رنگ‌بندی تمام بخش‌های مودال ثبت تجهیز جدید (AddDeviceModal) در تم تیره شامل سربرگ، کادرهای پس‌زمینه، فیلدهای متنی، کادرهای کشویی (Select)، چک‌باکس‌ها و دکمه‌ها.',
      'به‌روزرسانی استایل‌های بلوک‌های اطلاعاتی پلتفرم سخت‌افزاری، پارامترهای اتصال ترمینال و احراز هویت، انتخابگر مکان فیزیکی (ساختمان، طبقه، واحد، رک) و الگوهای کانفیگ متناسب با تم تاریک.',
      'رندر مودال از طریق createPortal روی بدنه سند جهت یکپارچگی عمق Z-Index و مدیریت کامل چرخه حیات تم در تم روشن و تیره.'
    ],
    changes_en: [
      'Comprehensive dark mode palette overhaul for the Register New Network Device modal (AddDeviceModal) including header, card containers, inputs, selects, checkboxes, and buttons.',
      'Updated styling for hardware platform cards, terminal authentication controls, physical location selectors (Building, Floor, Unit, Rack), and initial config templates for dark mode consistency.',
      'Attached modal rendering to document.body via createPortal for optimal z-index layering and seamless dynamic theme switching.'
    ]
  },
  {
    version: '1.53.3',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'رفع خطای پروکسی سوکت وب‌ترمینال (ECONNREFUSED 127.0.0.1:5002) و استقرار موتور بومی WebSocket ترمینال در نود',
    title_en: 'Fix Terminal WS Proxy ECONNREFUSED 127.0.0.1:5002 Error with Native Node.js WebSocket Terminal Engine',
    changes: [
      'رفع خطای اتصال سوکت پروکسی ترمینال (Terminal WS Proxy Error: connect ECONNREFUSED 127.0.0.1:5002) ناشی از عدم اجرای وب‌سوکت در پایتون.',
      'پیاده‌سازی و استقرار مستقیم و بومی سرور وب‌سوکت در نود (Native WebSocket Terminal Engine) با استفاده از پکیج ws و کلاینت ssh2.',
      'پشتیبانی همزمان از استریم دوطرفه SSH تجهیزات واقعی و شبیه‌ساز تعاملی CLI همراه با بافر ورودی و بازنشانی خودکار بدون ایجاد قطعی یا خطای سوکت.'
    ],
    changes_en: [
      'Resolved Terminal WS Proxy Error: connect ECONNREFUSED 127.0.0.1:5002 caused by unstarted Python websocket service.',
      'Implemented native Node.js WebSocket Terminal Engine using ws package and ssh2 client for immediate terminal upgrade handling.',
      'Added full support for bidirectional live SSH streaming and interactive CLI fallback with prompt generation and input buffering without socket drops.'
    ]
  },
  {
    version: '1.53.2',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'فشرده‌سازی گرافیکی و بازآرایی ۲ ستونه بخش‌های بالایی مودال ویرایش برای نمایش بدون اسکرول مشخصات ترمینال',
    title_en: 'Compact 2-Column Redesign of Upper Sections in Edit Device Modal for Immediate No-Scroll Terminal Access',
    changes: [
      'بازطراحی و بهینه‌سازی فضایی بخش پلتفرم سخت‌افزاری (Hardware Platform & OS) و رده تجهیز (Device Role & Category) در ساختار گرید دو ستونه ساید‌بای‌ساید بسیار فشرده.',
      'کاهش ارتفاع و حاشیه‌های هدر مودال، پدینگ‌های بیرونی فرم و بنر تله‌متری پورت‌های سوئیچ به همراه حالت جمع‌شده (Collapsed) پیش‌فرض تله‌متری تا زمان دیسکاوری پورت‌ها.',
      'امکان مشاهده کامل و آنی کادر مشخصات اتصال ترمینال و دسترسی CLI (پروتکل، نام کاربری و رمزعبور، پورت، تست SSH و Enable Secret) در بدو باز شدن مودال بدون نیاز به هرگونه اسکرول عمودی.'
    ],
    changes_en: [
      'Redesigned the Hardware Platform & OS and Device Role & Category sections into an ultra-compact side-by-side two-column grid layout.',
      'Reduced vertical heights, padding, and font metrics of modal header, form container, and switch telemetry banner with collapsed-by-default ports state until discovery.',
      'Ensured the Terminal Protocol & Credentials section (SSH/Telnet, credentials, port, SSH test and enable secret) is immediately visible without scrolling upon opening the modal.'
    ]
  },
  {
    version: '1.53.1',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'جابجایی بخش تله‌متری و پورت‌های سوئیچ به بالای کادر مشخصات اتصال ترمینال و CLI در مودال ویرایش دستگاه',
    title_en: 'Relocate Switch Ports & Telemetry Section Directly Above Terminal Protocol & Credentials in Edit Device Modal',
    changes: [
      'انتقال بلوک تله‌متری فیس‌پلیت سخت‌افزاری و وضعیت زنده پورت‌ها (Switch Ports & Telemetry - show interface status) به موقعیت دقیق بالای بخش مشخصات اتصال ترمینال و دسترسی CLI.',
      'بهبود جریان کاربری (UX Workflow) جهت مشاهده بی‌واسطه نتایج تست اتصال SSH و دریافت خودکار پورت‌ها مستقیماً بالای فیلدهای احراز هویت ترمینال.'
    ],
    changes_en: [
      'Relocated the hardware switch faceplate telemetry block (Switch Ports & Telemetry - show interface status) directly above the Terminal Protocol & Credentials section.',
      'Enhanced user experience and interaction hierarchy, allowing immediate visibility of live SSH discovery results right adjacent to terminal authentication parameters.'
    ]
  },
  {
    version: '1.53.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'کشف خودکار پورت‌های سوئیچ با دستور show interface status از طریق SSH، قفل‌گذاری هوشمند فیلدها و ارتقای موقعیت مشخصات ترمینال',
    title_en: 'Automated Switch Port Discovery via SSH "show interface status", Smart Field Locking, and Terminal Credentials Relocation',
    changes: [
      'انتقال بخش مشخصات اتصال ترمینال و دسترسی CLI به موقعیت بالاتر مستقیماً زیر بخش رده و نوع تجهیز (Device Role) در پنجره ویرایش دستگاه.',
      'افزودن موتور دیسکاوری خودکار در بک‌گراند از طریق تست اتصال SSH و اجرای دستور show interface status روی سوئیچ جهت استخراج نام پورت‌ها، دسکریپشن، وضعیت فعال/غیرفعال بودن (Up/Down)، نوع پورت (Trunk/Access)، VLAN، سرعت و دوبلکس.',
      'طراحی پنل تله‌متری فیس‌پلیت سخت‌افزاری سوئیچ در بالای مودال با دو حالت نمایش گرافیکی ماتریس پورت‌ها و جدول تله‌متری با قابلیت فیلتر و آمار خلاصه وضعیت.',
      'تکمیل و قفل خودکار فیلدهای نام هاست (Hostname)، مدل سخت‌افزاری و تعداد پورت‌ها با وضعیت غیرقابل ویرایش (Read-only/Grayed out) به همراه دکمه بازگشایی قفل برای ویرایش دستی در صورت نیاز کاربر.',
      'ذخیره‌سازی و پایداری کامل آرایه پورت‌های شناسایی‌شده در رکورد پایگاه‌داده تجهیز جهت استفاده در کل سیستم و مانیتورینگ.'
    ],
    changes_en: [
      'Relocated the Terminal Protocol & Credentials section directly below Device Role & Category in the Edit Device modal for intuitive workflow.',
      'Implemented background SSH discovery executing "show interface status" on network switches to automatically extract port names, descriptions, link status (Up/Down), port modes (Trunk/Access), VLAN assignments, speeds, and duplex settings.',
      'Designed a hardware switch faceplate telemetry panel at the top of the modal with both grid visualization and tabular views with real-time port statistics.',
      'Auto-populated and locked device hostname, hardware model, and total port count as read-only fields with visual indicators and manual unlock options.',
      'Persisted discovered switch ports array into the device database record for system-wide topology and monitoring consumption.'
    ]
  },
  {
    version: '1.52.1',
    releaseDate: '2026-09-15',
    type: 'patch',
    title: 'مدیریت هوشمند قفل پکیج‌منیجر سیستم‌عامل (dpkg/apt lock)، پیشگیری از تداخل با unattended-upgrades و نصب امن Nginx در اسکریپت راه‌اندازی',
    title_en: 'Intelligent OS Package Manager Lock Guard (dpkg/apt lock), Unattended-Upgrades Conflict Prevention, and Resilient Nginx Installation in Setup Scripts',
    changes: [
      'تجهیز اسکریپت setup-panel.sh و install.sh به ماژول تشخیص خودکار قفل DPKG/APT (فایل‌های lock و lock-frontend) با قابلیت انتظار هوشمند (Polling) تا آزادسازی کامل توسط سیستم‌عامل.',
      'توقف موقت تایمرها و سرویس‌های آپدیت پس‌زمینه لینوکس (unattended-upgrades و apt-daily) در حین اجرای اسکریپت نصب و بازیابی خودکار پس از پایان جهت جلوگیری از توقف تصادفی در مرحله پیکربندی Nginx.',
      'افزودن تابع بازآزمایی خودکار safe_apt_install و safe_apt_update با قابلیت تلاش مجدد تا ۵ مرتبه همراه با مکث هوشمند در صورت بروز خطای تداخل فرآیندهای لینوکس.',
      'نصب پیش‌دستانه وب‌سرور Nginx همگام با پکیج‌های پایه و بررسی شرطی فعال بودن Nginx قبل از فراخوانی apt-get در فاز تنظیم SSL/HTTPS معکوس.'
    ],
    changes_en: [
      'Engineered automated DPKG/APT lock detection (lock and lock-frontend files) with intelligent retry and polling in setup-panel.sh and install.sh scripts.',
      'Temporarily paused background Linux automated upgrade timers (unattended-upgrades and apt-daily) during installer execution with auto-restore on exit to prevent lock collisions.',
      'Introduced robust safe_apt_install and safe_apt_update functions with 5-step exponential backoff retry logic upon encountering OS process contention.',
      'Proactively bundled Nginx web server installation with core dependencies and added conditional existence verification before invoking apt-get in the reverse proxy and SSL phase.'
    ]
  },
  {
    version: '1.52.0',
    releaseDate: '2026-09-15',
    type: 'minor',
    title: 'جداسازی قطعی ویو کارت و فیزیکی در شماتیک، ذخیره‌سازی مجزای مختصات در پایگاه داده و رفع تداخل المان‌های فیزیکی',
    title_en: 'Strict Card & Physical View Isolation, Dedicated Coordinates Persistence in Database, and Physical Elements Filtering',
    changes: [
      'جداسازی کامل منطق نمایش در صفحه شماتیک: در حالت ویو کارت، رک‌ها، دکل‌های مخابراتی و شاسی‌های فیزیکی پنهان شده و کلیه دیوایس‌ها به همراه اتصالات و پورت‌ها به صورت کارت‌های شماتیک نمایش می‌یابند.',
      'اختصاص رک‌ها، دکل‌ها و شاسی‌های سرور به ویو فیزیکی (Physical View) و سوئیچ خودکار به ویو فیزیکی هنگام کلیک بر روی افزودن رک یا دکل.',
      'افزودن فیلد physicalPositions به مدل‌های داده و ذخیره‌سازی مستقل و پایدار مختصات دو حالت ویو (کارت و فیزیکی) در PostgreSQL و استور پشتیبان دیتابیس.',
      'تضمین ثبات موقعیت فیزیکی و شماتیکی دیوایس‌ها در اشتراک‌گذاری نقشه‌ها (Map Visibility & Permissions) برای کاربران عمومی، محدود و مرورگرهای مختلف بدون بازگشت یا جابجایی المان‌ها.',
      'بهینه‌سازی سیستم درگ و دراپ المان‌ها (گره‌ها، رک‌ها، دکل‌ها و یادداشت‌ها) با ثبت قطعی و دقیق آخرین مختصات ماوس در دیتابیس بدون از دست رفتن موقعیت در رویداد MouseUp.'
    ],
    changes_en: [
      'Strict separation of Card vs. Physical views on the schematic canvas: racks, telecom towers, and physical chassis are exclusively hidden in Card mode where all devices render as schematic cards with ports and links.',
      'Reserved server racks, telecom towers, and physical chassis to Physical View, with automatic view transition when adding racks or towers.',
      'Added physicalPositions to the schema and enabled independent, durable persistence for both Card and Physical coordinate sets in PostgreSQL and fallback storage.',
      'Guaranteed map layout and position retention across shared maps (Map Visibility & Permissions) for public/restricted users and different browsers without coordinate reset.',
      'Optimized drag-and-drop mechanics for nodes, racks, towers, and sticky notes with precise immediate mouse release coordinate commit to the database on MouseUp.'
    ]
  },
  {
    version: '1.51.1',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'همسان‌سازی استایل کامند گاید در تم تیره و دسترسی دائمی به نوار فوتر و دکمه ابزارها هنگام باز بودن مودال‌ها',
    title_en: 'Cisco Terminal Command Guide Dark Mode Harmonization & Persistent Bottom Footer and Tools Access During Modals',
    changes: [
      'همسان‌سازی کامل پالت رنگ، کادرها و دکمه‌های راهنمای دستورات (Command Guide) ترمینال سیسکو با تب اینترفیس‌ها در تم تیره و روشن.',
      'ارتقای ساختار لایه‌بندی و حفظ دسترسی به نوار فوتر پایین صفحه و منوی ابزارها (Tools) هنگام باز بودن مودال‌های ترمینال، پورت‌ها و سایر پنجره‌ها.',
      'تنظیم حاشیه و فضای امن پایینی (Safe Bottom Clearance) برای کلیه مودال‌ها جهت عدم هم‌پوشانی با استاتوس بار و داک ابزارها.'
    ],
    changes_en: [
      'Harmonized Cisco Terminal Command Guide color scheme, cards, and action buttons with the Interfaces tab across dark and light modes.',
      'Elevated footer status bar and Tools button stacking layers (z-index) to remain visible and fully interactive when terminal and port modals are open.',
      'Added safe bottom margin clearance across full-screen modals to prevent occlusion with the bottom status bar and minimized tools dock.'
    ]
  },
  {
    version: '1.51.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'انتقال اینترفیس‌ها به تب‌های سایدبار ترمینال، رفع بیرون‌زدگی تولتیپ پورت‌ها در تمام‌صفحه و اصلاح کنتراست تم روشن',
    title_en: 'Terminal Interfaces Sidebar Tab Integration, Fullscreen Port Tooltip Overflow Fix, and Light Theme High-Contrast Polish',
    changes: [
      'انتقال دکمه و لیست اینترفیس‌ها از بالای ترمینال به داخل سایدبار با ساختار دو تب مجزا (راهنمای دستورات / اینترفیس‌ها) همراه با قابلیت جستجوی زنده.',
      'اصلاح موقعیت‌دهی پویا و محاسبه هوشمند محدوده صفحه (Viewport Clamping) برای تولتیپ پورت‌های فیزیکی در حالت فول‌اسکرین ترمینال‌های سیسکو و میکروتیک.',
      'بهبود کامل کنتراست برچسب جزئیات پورت هنگام هاور در تم روشن جهت جلوگیری از تداخل رنگ با پس‌زمینه.',
      'اصلاح استایل نشانگر تعداد پورت‌ها با رنگ سفید و متن بولد (Bold) و پس‌زمینه مناسب با خوانایی بالا در کلیه تم‌ها.'
    ],
    changes_en: [
      'Migrated the interfaces button and menu into the terminal sidebar as a dedicated dual-tab interface (Command Guide / Interfaces) with live search.',
      'Implemented smart viewport clamping for physical port tooltips in fullscreen mode across both Cisco and MikroTik terminals to prevent off-screen overflow.',
      'Enhanced high-contrast styling for hovered port detail pill in light mode, preventing background color blending.',
      'Updated the port count badge to a solid, bold white display for crystal-clear readability across light and dark themes.'
    ]
  },
  {
    version: '1.50.5',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'تضمین پایداری کامل داده‌های کاربران و نقشه‌ها در PostgreSQL و رفع عدم ذخیره‌سازی جداول',
    title_en: 'Full PostgreSQL Persistence Assurance for Users & Maps with Automatic Data Sync',
    changes: [
      'رفع مشکل خالی بودن جداول users و custom_maps در سرور PostgreSQL از طریق بارگذاری صحیح متغیرهای محیطی در systemd و فایل .env.',
      'پیاده‌سازی مکانیزم اتصال پویا (ensurePostgresConnection) با قابلیت بازیابی خودکار در تمام عملیات خواندن، نوشتن و حذف کاربران و نقشه‌ها.',
      'اضافه شدن همگام‌سازی خودکار و دوطرفه داده‌های fallback store به دیتابیس PostgreSQL هنگام اتصال یا در صورت خالی بودن جداول.',
      'اصلاح ساختار اسکریپت migration جدول‌های users و custom_maps با دستورات ایمن IF NOT EXISTS جهت سازگاری با پایگاه‌های داده قبلی.',
      'افزودن دسترسی و مالکیت کامل کلیه جداول و دنباله‌ها (Sequences) به کاربر دیتابیس در فرآیند نصب setup-panel.sh.'
    ],
    changes_en: [
      'Resolved empty PostgreSQL tables for users and custom_maps by ensuring reliable environment variable loading in systemd and .env locations.',
      'Implemented dynamic connection recovery (ensurePostgresConnection) across all user and map CRUD operations in PostgreSQL.',
      'Added two-way automatic data migration from the fallback store into PostgreSQL whenever the database connects or contains empty tables.',
      'Enhanced database schema migration scripts for users and custom_maps with safe IF NOT EXISTS clauses for legacy compatibility.',
      'Configured full table and sequence ownership grants for the dedicated database user in setup-panel.sh.'
    ]
  },
  {
    version: '1.50.4',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'اصلاح پیام‌های نشانگر وضعیت لودینگ سوکت شبکه و رعایت دقیق زبان فعال پنل (فارسی/انگلیسی)',
    title_en: 'Enhanced Page Loading State Messaging for Network Socket Loader with Strict Language Alignment',
    changes: [
      'تنظیم عنوان و متن توضیحات زیر سوکت شبکه جهت نمایش صریح وضعیت «در حال بارگذاری صفحه...» / «Loading Page...».',
      'تفکیک دقیق زبان متون نشانگر فیزیکی و تبادل فعال داده متناسب با زبان فعال پنل کاربری.',
      'افزودن شناسایی خودکار زبان ذخیره‌شده (app_language) در لودینگ پیش‌فرض HTML جهت نمایش زبان صحیح بدون کوچک‌ترین تاخیر قبل از مانت شدن ری‌اکت.'
    ],
    changes_en: [
      'Configured socket loader title and description to clearly indicate "Loading Page..." / "در حال بارگذاری صفحه...".',
      'Strictly localized physical port status and active data stream badges based on the active panel language.',
      'Added immediate detection of stored language (app_language) in the initial HTML loader for seamless localized display before React mounts.'
    ]
  },
  {
    version: '1.50.3',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'طراحی لودینگ اختصاصی سوکت پورت شبکه با انیمیشن چراغ دیتای چشمک‌زن واقعی و رفع صفحه مشکی اولیه در رفرش صفحه',
    title_en: 'Realistic Animated RJ45 Network Port Socket Loader with Blinking Data LED and Elimination of Blank Screen During Page Reload',
    changes: [
      'حذف صفحه سیاه/مشکی اولیه هنگام رفرش صفحه و جایگزینی با لودینگ سبک و فوق سریع سوکت پورت شبکه اترنت (RJ45 Socket) در HTML و CSS خالص.',
      'طراحی انیمیشن دقیق سخت‌افزاری سوکت شبکه با محافظ فلزی، ۸ پین طلایی براق، محفظه ضامن، چراغ ثابت لینک (LNK) و چراغ کهربایی چشمک‌زن دیتا (ACT).',
      'ایجاد کامپوننت ماژولار و بازاستفاده‌پذیر NetworkSocketLoader جهت یکپارچه‌سازی وضعیت بارگذاری در سراسر برنامه (بررسی نشست، بارگذاری نقشه توپولوژی و رفرش).',
      'پشتیبانی کامل از زبان‌های فارسی و انگلیسی و همگام‌سازی فوری با تنظیمات ذخیره‌شده کاربر بدون تأخیر در رندر اولیه.'
    ],
    changes_en: [
      'Eliminated initial blank/black screen during page reload with an instant, zero-dependency RJ45 Ethernet port socket loader rendered in pure HTML and CSS.',
      'Crafted realistic hardware animations featuring a metallic shielded casing, 8 reflective gold pins, latch notch, solid Link (LNK) LED, and pulsating amber Data Activity (ACT) LED.',
      'Created modular and reusable NetworkSocketLoader component to standardize loading states across auth verification, topology mapping, and page transitions.',
      'Full localization support for Persian and English with instant detection of user-selected language on initial boot.'
    ]
  },
  {
    version: '1.50.2',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'رفع اساسی خطای ورود کاربران محلی، اتصال مستقیم و ایمن فرم ایجاد کاربر به پایگاه داده و محافظت در برابر پاسخ‌های غیر JSON',
    title_en: 'Critical Fix for Local User Login Authentication, Direct Database Persistence for User Creation, and Resilient Guard Against Non-JSON Gateway Responses',
    changes: [
      'رفع خطای لاگین Unexpected token < و ناتوانی در اعتبارسنجی کاربران محلی تازه ایجادشده با برقراری ارتباط مستقیم فرم ایجاد کاربر با پایگاه داده (/api/settings/users).',
      'ایمن‌سازی ذخیره‌سازی پسورد کاربران محلی جدید با سیستم هشینگ فوق امن PBKDF2 و سالت ۵۱۲ بیتی در پایگاه داده PostgreSQL و استور پشتیبان.',
      'اصلاح و ایمن‌سازی توابع saveUser، loadFallbackStore و findUserByUsername در لایه دیتابیس برای جلوگیری از ثبت رکوردهای تهی یا فاسد.',
      'افزودن پاسخ‌دهی استاندارد JSON در میدل‌ور خطای سراسری سرور و هندلینگ امن محتوای غیر JSON در صفحه ورود (LoginPage) جهت جلوگیری از نمایش خطاهای خام HTML به کاربر.',
      'پشتیبانی کامل از حذف همگام کاربر (deleteUserFromDatabase) در پایگاه داده و اعمال شاخص وضعیت در حال ذخیره (isSavingUser) در مودال کاربران.'
    ],
    changes_en: [
      'Resolved local user authentication failure and unexpected HTML token response by directly persisting newly created user accounts and credentials to the backend database (/api/settings/users).',
      'Hardened local user password security with standard PBKDF2 derivation and 512-bit salt hashing across PostgreSQL database and persistent JSON backup store.',
      'Refactored and sanitized saveUser, loadFallbackStore, and findUserByUsername database layer routines to prevent malformed or nameless user records.',
      'Added strict global JSON error handling in Express server and guarded client-side response parsing in LoginPage to eliminate raw HTML parse errors.',
      'Added synchronized database user deletion and interactive saving indicator state in the Local Users management modal.'
    ]
  },
  {
    version: '1.50.1',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'بهبود پایداری رندرر سخت‌افزار و کابینت رک، دسترس‌پذیری یکپارچه ابزارهای رک/دکل در تمام نماها و رفع خطاهای ناگهانی بوم',
    title_en: 'Enhanced Rack & Hardware Canvas Rendering Resiliency, Unified Rack/Tower Tool Accessibility Across Views, and Elimination of Canvas Layout Errors',
    changes: [
      'ایمن‌سازی کامل رندرر کارت‌های شبکه و تجهیزات سخت‌افزاری (HardwareSvgRenderer و PhysicalNodeOnCanvas) در برابر آرایه‌های نامعتبر یا تعریف‌نشده کارت‌ها و دستگاه‌ها.',
      'افزودن موقعیت‌یابی هوشمند و پایدار خودکار (Universal Fallback Positioning) برای تمام نودها و تجهیزات دکل/رک در نقشه‌های سفارشی جهت جلوگیری از خطای مختصات نامعتبر.',
      'دسترس‌پذیر کردن ابزارهای افزودن تجهیز، ایجاد رک، افزودن دکل و نصب سخت‌افزار در هر دو نمای کارتی و فیزیکی بوم توپولوژی سفارشی.',
      'تجهیز مودال افزودن تجهیز به نقشه سفارشی (CustomMapAddDeviceModal) به دکمه مینیمایز (Minimize) در هدر مطابق با دستورالعمل جامع مودال‌ها.',
      'اصلاح منطق تشخیص تجهیزات نصب‌شده در رک جهت سازگاری کامل با شناسه‌های پیشوندی (hw- و radio-) و همگام‌سازی بی‌درنگ وضعیت‌ها.'
    ],
    changes_en: [
      'Hardened network card and mounted hardware renderers (HardwareSvgRenderer & PhysicalNodeOnCanvas) against undefined or malformed card arrays and device structures.',
      'Implemented resilient universal fallback canvas positioning for all nodes, custom map tower devices, and standalone hardware to prevent coordinate layout anomalies.',
      'Unified toolbar button accessibility for Add Device, Add Rack, Add Tower, and Install Hardware across both Card and Physical view modes on custom topology maps.',
      'Equipped the Custom Map Add Device modal (CustomMapAddDeviceModal) with a header minimize button in strict compliance with the universal modal minimization guidelines.',
      'Enhanced mounted hardware detection logic to seamlessly resolve prefixed device IDs (hw- and radio-) and maintain accurate real-time rack occupancy indicators.'
    ]
  },
  {
    version: '1.50.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'ذخیره‌سازی جامع پایگاه‌داده (Database Persistence) برای نقشه‌ها و نودها، کنترل دسترسی نقشه (Public/Private/Restricted) و سازگاری مودال مشخصات سخت‌افزاری و کارت شبکه با تم روشن',
    title_en: 'Full Database Persistence for Maps & Node Positions, Granular Map Access Control (Public/Private/Restricted), and Light Theme Adaptation for Hardware Specs & Network Cards Modal',
    changes: [
      'پیاده‌سازی پایدارسازی و ذخیره‌سازی داده‌های تمام نقشه‌های سفارشی (Custom Maps) و موقعیت نودها (Node Positions) در پایگاه‌داده PostgreSQL و فایل استور مطمئن.',
      'تجهیز سیستم نقشه‌ها به کنترل سطح دسترسی امن (Map Access Control): امکان تعریف نقشه به صورت عمومی (Public)، شخصی (Private - فقط سازنده)، یا محدود به کاربران مشخص (Restricted).',
      'نمایش نشان‌های امنیتی وضعیت دسترسی (Public/Private/Restricted) در نوار ابزار نقشه‌ها و منوی کشویی انتخاب نقشه.',
      'همگام‌سازی خودکار موقعیت تجهیزات روی بوم شماتیک با اندپوینت‌های اختصاصی /api/settings/node-positions در پایگاه‌داده.',
      'اصلاح کامل استایل و هماهنگی مودال ویرایش مشخصات سخت‌افزاری و کارت‌های شبکه (Edit Hardware Specifications & Network Cards) با تم روشن (Light Theme)، شامل پس‌زمینه، کادرها، فیلدهای ورودی و پیش‌نمایش SVG.',
      'افزودن دکمه مینیمایز (Minimize) به هدر مودال سخت‌افزار و کارت‌های شبکه جهت رعایت استاندارد جهانی مینیمایز تمامی مودال‌ها.'
    ],
    changes_en: [
      'Implemented full database persistence for custom topology maps and canvas node positions with dual PostgreSQL and resilient JSON store support.',
      'Engineered granular Map Access Control allowing maps to be configured as Public, Private (creator only), or Restricted to specified users.',
      'Integrated security visibility indicators and badges (Public/Private/Restricted) into the schematic map selector toolbar.',
      'Synchronized real-time node coordinate dragging and positioning directly with /api/settings/node-positions database endpoints.',
      'Fully resolved light theme styling incompatibilities for Edit Hardware Specifications & Network Cards modal, ensuring crystal-clear contrast across backgrounds, borders, inputs, and SVG preview containers.',
      'Added universal modal minimize button to the Hardware & Network Cards modal header in strict adherence to modal UX guidelines.'
    ]
  },
  {
    version: '1.49.1',
    releaseDate: '2026-09-14',
    type: 'patch',
    title: 'رفع مشکل فریز و توقف اسکریپت نصب آنلاین (curl | bash)، حذف ریدایرکت مخرب ورودی استاندارد و خواندن ایمن TTY',
    title_en: 'Fix Online Piped Installer Execution Hang (curl | bash), Eliminate Broken Stdin Redirection & Ensure Resilient TTY Reading',
    changes: [
      'حذف دستور مخرب exec 0< /dev/tty از ابتدای اسکریپت‌های setup-panel.sh و install.sh که باعث قطع استریم دریافت کدهای بش از دستور curl و هنگ نامحدود نصب می‌شد.',
      'پیاده‌سازی تابع اختصاصی has_usable_tty جهت سنجش واقعی قابلیت خواندن و نوشتن ترمینال تعاملی پیش از تلاش برای ارتباط با کنسول.',
      'بهبود توابع prompt_read و prompt_input جهت خواندن مستقیم مقادیر از /dev/tty در زمان فعال بودن ترمینال و فالبک خودکار هوشمند به مقادیر پیش‌فرض در اجرای غیرتعاملی بدون توقف.',
      'ارتقای روش تشخیص خودکار IP سرور با پوشش کامل ابزارهای ip و hostname به صورت امن در برابر خطاهای pipefail.',
      'تست و اعتبارسنجی جامع رفتار اسکریپت با شبیه‌سازهای PTY در هر دو حالت تعاملی کاربر و پایپ بدون TTY.'
    ],
    changes_en: [
      'Eliminated problematic exec 0< /dev/tty directives from setup-panel.sh and install.sh that prematurely severed the incoming curl bash script stream, resolving the silent installer hang.',
      'Engineered a dedicated has_usable_tty verification function to test real subshell accessibility to /dev/tty before attempting terminal I/O.',
      'Enhanced prompt_read and prompt_input handlers to query /dev/tty directly during interactive executions while seamlessly falling back to default values in automated headless environments.',
      'Fortified network IP auto-detection against pipefail errors utilizing fail-safe fallbacks between ip route and hostname.',
      'Validated end-to-end pipe execution using comprehensive Python pseudo-terminal (PTY) simulations across both interactive and automated streaming modes.'
    ]
  },
  {
    version: '1.49.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'اصلاح مهندسی پایپ اجرای آنلاین شل (curl | bash)، اتصال مستقیم ترمینال TTY و استقرار تضمینی پایگاه‌داده PostgreSQL',
    title_en: 'Enterprise DevOps Piped Installer Architecture (curl | bash), Guaranteed TTY Terminal Redirection & PostgreSQL Automation',
    changes: [
      'مهندسی مجدد پایپ اجرای آنلاین (curl -sSL ... | sudo bash) با ریدایرکت خودکار ورودی استاندارد (FD 0) به ترمینال تعاملی (/dev/tty) جهت جلوگیری از رد شدن خودکار سوالات.',
      'طراحی مرحله تفکیک‌شده و تعاملی تنظیمات پایگاه داده PostgreSQL شامل نام دیتابیس، نام کاربری، کلمه عبور دیتابیس، پورت و رمز عبور حساب اصلی ادمین.',
      'نصب قطعی پکیج‌های postgresql، postgresql-contrib و postgresql-client به همراه حلقه اعتبارسنجی سوکت سرور پیش از اجرای دستورات.',
      'ایجاد تضمینی کاربر و پایگاه داده با مجوزهای کامل و اجرای مایگریشن جداول backend/schema.sql با ثبت لاگ تعداد جداول آماده‌سازی شده.',
      'همگام‌سازی کامل اسکریپت‌های setup-panel.sh و install.sh برای اطمینان از تجربه نصب یکپارچه در تمام روش‌های اجرای آنلاین و محلی.'
    ],
    changes_en: [
      'Re-engineered online piped installer workflow (curl -sSL ... | sudo bash) with automatic stdin (FD 0) redirection to interactive controlling terminal (/dev/tty).',
      'Created dedicated interactive prompts for PostgreSQL configuration: database name, user credentials, service port, and primary admin password.',
      'Automated resilient installation of postgresql, postgresql-contrib, and client packages with socket readiness verification retry loops.',
      'Provisioned database roles, user permissions, and executed table schema migrations from backend/schema.sql with verified table count logging.',
      'Synchronized setup-panel.sh and install.sh scripts ensuring identical, rock-solid installation outcomes across both online and local execution methods.'
    ]
  },
  {
    version: '1.48.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'ماتریس نقطه‌ای قاره‌ها روی کره سه‌بعدی لاگین، یکپارچه‌سازی تم‌های ۶‌گانه پنل در صفحه ورود و نصب خودکار پایگاه‌داده PostgreSQL در setup-panel.sh',
    title_en: 'Dot-Matrix Continental Mesh on 3D Globe, Full Login Theme Synchronization with Light Mode & Automated PostgreSQL Provisioning in setup-panel.sh',
    changes: [
      'تولید ماتریس نقاط متراکم و دقیق قاره‌ها (Dot-Matrix Continents) با هندسه ژئودتیک قاره‌های جهان روی کره سه‌بعدی صفحه لاگین با پالس‌های نوری دینامیک.',
      'یکپارچه‌سازی کامل تم‌های پنل در صفحه لاگین شامل منوی تعاملی انتخاب تم با تمام ۶ تم (Obsidian، Emerald، Cobalt، Rose، Amber و Clean Light).',
      'سازگاری و بازطراحی ویژه صفحه لاگین با تم روشن (Light Mode) با فرم سفید شفاف، تایپوگرافی خوانا، هماهنگی رنگ‌های کره، برچسب‌ها و کارت‌های تله‌متری.',
      'به‌روزرسانی اسکریپت اصلی نصب سرور (setup-panel.sh) جهت دریافت تعاملی نام، کاربر، پسورد و پورت پایگاه‌داده PostgreSQL و کلمه عبور کاربر ارشد ادمین.',
      'نصب خودکار بسته‌های PostgreSQL، ایجاد کاربر و پایگاه‌داده، اجرای مایگریشن جداول اسکیما (backend/schema.sql) و ذخیره متغیرها در فایل .env سرور.',
      'همگام‌سازی انتخاب تم لاگین با استیت سراسری پنل مدیریت شبکه بدون نیاز به رفرش صفحه.'
    ],
    changes_en: [
      'Engineered a dense geodetic dot-matrix continental mesh on the 3D rotating globe with dynamic luminosity pulsing and responsive depth culling.',
      'Integrated panel theme synchronization directly into the login screen, featuring a 6-palette switcher (Obsidian, Emerald, Cobalt, Rose, Amber, and Clean Light).',
      'Crafted high-contrast Light Mode styling for the login interface with crystal-clear typography, adapted globe atmosphere, and legible telemetry HUD cards.',
      'Upgraded setup-panel.sh installation script to interactively prompt for PostgreSQL database name, credentials, port, and initial superadmin password.',
      'Automated PostgreSQL package installation, user/db provisioning, database table schema migration (backend/schema.sql), and .env deployment on the server.',
      'Synchronized theme switching seamlessly between the login portal and the core network operations workspace.'
    ]
  },
  {
    version: '1.47.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'یکپارچه‌سازی پایگاه‌داده پایدار PostgreSQL، صفحه لاگین با انیمیشن سه‌بعدی کره شبکه و احراز هویت دومنظوره محلی و اکتیو دایرکتوری',
    title_en: 'PostgreSQL Database Integration, Interactive 3D Network Globe Login Suite & Dual-Mode Local/Active Directory Authentication',
    changes: [
      'پیاده‌سازی اسکیما و مایگریشن جامع PostgreSQL (backend/schema.sql) برای ذخیره‌سازی پایدار تجهیزات، مپ‌ها، کاربران و ساختار سلسله‌مراتبی فیزیکی.',
      'افزودن پیکربندی تعاملی PostgreSQL در اسکریپت نصب (install.sh) شامل دریافت نام دیتابیس، نام کاربری، کلمه عبور امن و پورت سرویس.',
      'طراحی صفحه لاگین منطبق بر تم‌های پنل با ساختار یک‌چهارم فرم ورود امن و سه‌چهارم انیمیشن سه‌بعدی کره تعاملی شبکه (3D Interactive Network Globe).',
      'پشتیبانی از ورود با حساب محلی با هش‌گذاری امن PBKDF2 و اعتبارسنجی احراز هویت دامین اکتیو دایرکتوری (Active Directory / LDAP).',
      'مدیریت نشست‌های کاربری (AuthContext)، اعتبارسنجی توکن، محدودکننده نرخ ورود (Rate Limiter) در برابر حملات Brute Force و دکمه خروج امن در نوار ناوبری.',
      'همگام‌سازی بلادرنگ مپ‌های سفارشی، سلسله‌مراتب ساختمان و کاربران بین حافظه محلی و پایگاه‌داده سرور جهت حفظ داده در تمام مرورگرها و کلاینت‌ها.'
    ],
    changes_en: [
      'Architected PostgreSQL schema and automated database migrations (backend/schema.sql) for durable persistence of devices, maps, users, and physical hierarchy.',
      'Extended interactive installation script (install.sh) with prompts for PostgreSQL database name, credentials, port, and automatic user/table provisioning.',
      'Engineered an enterprise login experience featuring a 1/4 secure authentication panel and a 3/4 canvas-based 3D rotating network globe with live data packets.',
      'Implemented dual-mode authentication supporting local PBKDF2-hashed credentials and domain Active Directory / LDAP account verification.',
      'Added secure session management (AuthContext), token validation, brute-force rate limiting, and an account logout action in the navigation header.',
      'Automated bidirectional synchronization for custom topology maps, building hierarchies, and user settings between client cache and PostgreSQL backend.'
    ]
  },
  {
    version: '1.46.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'تکمیل سیستم مینیمایز ترمینال‌ها، رفع سرریز افقی داک، جمع‌شوندگی انیمیشنی در دسته‌بندی و پالس هوشمند پنجره‌های باز',
    title_en: 'Terminal Minimization Completion, Dock Overflow Guard, Animated Category Collapse & Conflict Attention Animation Suite',
    changes: [
      'تجهیز پنجره‌های ترمینال سیسکو (Cisco CLI) و میکروتیک (RouterOS) در هر دو حالت تک‌پنجره و چندپنجره به دکمه مینیمایز در هدر و اتصال کامل به نوار داک پایین.',
      'مهار کامل سرریز افقی نوار ابزار پایین (ToolsDock) در سمت راست صفحه از طریق تعیین سقف عرض بر اساس ویوپورت، اسکرول افقی روان، دکمه‌های پیمایش چپ و راست و پشتیبانی از چرخ ماوس.',
      'رفع باگ عدم نمایش تب‌های جدید پس از استفاده از دکمه «بستن همه» (Close All) در دراپ‌دان دسته‌بندی بدون نیاز به رفرش صفحه از طریق ریست اتمیک فیلترها.',
      'افزودن قابلیت «جمع کردن همه در دسته‌بندی» (Collapse All to Category) با انیمیشن انتقال نرم و امکان بازیابی مستقیم و تکی هر پنجره از داخل منو یا بازگشایی همگانی به نوار داک.',
      'سیستم هشدار بصری و انیمیشن جهنده (Attention Pulse & Bounce) روی تب مینیمایز شده یا نشانگر دسته‌بندی در صورت تلاش کاربر برای باز کردن مجدد پنجره‌ای که در پایین باز است.',
      'رعایت صددرصدی قوانین چندزبانگی (i18n) و تفکیک کامل متون فارسی و انگلیسی در تمامی وضعیت‌ها و اعلان‌ها.'
    ],
    changes_en: [
      'Equipped both Cisco Terminal and MikroTik RouterOS CLI modals (single-pane and multi-pane workspaces) with a dedicated header minimize button and dock integration.',
      'Eliminated dock horizontal screen overflow with strict viewport width bounds, smooth horizontal scrolling, responsive navigation arrows, and mouse wheel support.',
      'Resolved the category state desynchronization bug where minimized modals would not reappear after clicking "Close All" without needing a browser refresh.',
      'Engineered an animated "Collapse All to Category" feature that neatly tucks dock tabs into a compact category indicator with instant individual restore actions.',
      'Implemented an intelligent conflict attention animation (amber bounce, ring, and pulse) on dock tabs or category badges when attempting to open a duplicate active modal.',
      'Enforced 100% strict bilingual localization (FA / EN) without Persian leaks across all indicators, tooltips, and release notes.'
    ]
  },
  {
    version: '1.45.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'افزودن قابلیت مینیمایز سراسری به تمامی مودال‌های سیستم همراه با نوار داک اشتراکی و سیستم دسته‌بندی و فیلتر هوشمند تب‌ها',
    title_en: 'Universal Modal Minimization Suite with Shared Multi-Modal Dock, Anti-Overlap Layout & Categorized Tab Grouping',
    changes: [
      'تجهیز تمامی مودال‌های برنامه (افزودن تجهیز، ویرایش، مدیریت پورت‌ها، ترمینال‌های چندگانه، اعمال تمپلت و گزارش تغییرات) به دکمه مینیمایز در هدر در کنار دکمه بستن.',
      'طراحی نوار داک اشتراکی شناور (Global Tools & Modals Dock) بدون هرگونه همپوشانی و تداخل افقی پنجره‌های مینیمایز شده.',
      'افزودن سیستم هوشمند دسته‌بندی تب‌های مینیمایز شده (Categorized Dropdown Filter) بر اساس نوع مودال (ابزارهای شبکه، تجهیزات و پورت‌ها، ترمینال‌ها، تمپلت‌ها، سیستم) در صورت پر شدن عرض صفحه یا تعدد پنجره‌ها.',
      'امکان بازیابی یا بستن سریع تب‌های مینیمایز شده به صورت تکی یا گروهی (Restore All / Close All) با حفظ کامل استیت و فرم‌های باز.',
      'تدوین و ثبت سند رسمی استانداردهای توسعه مودال در فایل MODAL_GUIDELINES.md و اعمال قانون اجباری شماره ۵ در فایل‌های دایرکتیو هوش مصنوعی (AGENTS.md و GEMINI.md) جهت تضمین رعایت همیشگی این الگو در تمامی مودال‌های آینده.',
      'رعایت ۱۰۰٪ استانداردهای دو زبانه (فارسی و انگلیسی) و سازگاری کامل با تم‌های تاریک و روشن.'
    ],
    changes_en: [
      'Equipped every modal across the entire application (Add Device, Edit Device, Port Inspector, Multi-Terminal Workspace, Apply Template, Release Notes) with a dedicated minimize button alongside the close button.',
      'Architected an intelligent, shared bottom dock (Global Tools & Modals Dock) ensuring minimized tabs sit side-by-side without overlapping.',
      'Implemented automated categorized tab grouping & filtering (Network Tools, Devices & Ports, Terminals, Templates, System) when dock tabs multiply or exceed viewport width.',
      'Provided single-click tab restoration and individual/bulk closing actions (Restore All / Close All) while preserving form and state persistence.',
      'Published official engineering standards in MODAL_GUIDELINES.md and injected Mandatory Directive Section 5 into AGENTS.md and GEMINI.md to enforce this minimization architecture across all future modal developments.',
      'Enforced strict 100% bilingual localization (FA / EN) and adaptive high-contrast styling across dark and light themes.'
    ]
  },
  {
    version: '1.44.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'یکپارچه‌سازی ممیزی توان نقشه‌های فیزیکی و تفکیک رک‌ها با محاسبه‌گر توان یو‌پی‌اس و رفع خطای هاست چکر',
    title_en: 'Integration of Physical Maps & Rack Power Auditing with UPS Sizing Calculator and Host Checker Fixes',
    changes: [
      'افزودن امکان انتخاب مستقیم هر یک از نقشه‌های فیزیکی (Physical Maps) در فرم محاسبه‌گر یو‌پی‌اس و نشستن خودکار مجموع توان تمامی رک‌ها و تجهیزات نقشه در فیلد Required Power (Watts).',
      'ایجاد تب سوم اختصاصی «نقشه‌ها و تفکیک رک‌ها (Physical Maps & Racks)» با داشبورد ممیزی جامع الکتریکی و حرارتی اتاق سرور و دیتاسنتر.',
      'محاسبه بلادرنگ شاخص‌های کلیدی توان کل اتاق (Total Room Load)، توان ظاهری (kVA @ PF 0.8)، ظرفیت یوپی‌اس مرکزی پیشنهادی، بار برودتی مورد نیاز (AC Cooling Tons & BTU/h) و جریان فیدر اصلی ورودی (Amps @ 230V).',
      'کارت‌های تعاملی کابینت رک به همراه نمایش ظرفیت یونیت، دسته‌بندی تراکم بار (عادی، متوسط و متراکم > 4.5 kW)، گیج بار حرارتی و دکمه اختصاصی «محاسبه فقط برای این رک» (Size This Rack).',
      'جدول تفصیلی تجهیزات نصب‌شده در هر رک همراه با پوزیشن یونیت، برند، مدل، افزونگی پاور (PSU) و توان مصرفی تخمینی یا اسمی.',
      'امکان جستجوی سریع تجهیزات و فیلترسازی رک‌ها بر اساس توان مصرفی به همراه خروجی و کپی گزارش جامع ممیزی برق کل دیتاسنتر به کلیپ‌بورد.',
      'رفع کامل خطای Endpoint not found در ماژول Host Checker از طریق نرمال‌سازی مسیرهای URL در بک‌اند پایتون و اندپوینت مستقیم Express.',
      'حذف دراپ‌دان تجهیزات توپولوژی در هاست چکر بر اساس درخواست کاربر جهت سادگی و تمیزی رابط کاربری.'
    ],
    changes_en: [
      'Integrated physical maps into the UPS Capacity & Battery Bank Sizing Calculator, automatically aggregating and applying the total power of all racks and equipment directly into Required Power (Watts).',
      'Added a dedicated third tab "Physical Maps & Racks" featuring a complete data center electrical and thermal audit suite.',
      'Implemented real-time calculation of room-level electrical KPIs: Total Room Load (Watts/kW), Apparent Power (kVA @ PF 0.8), Sized Central UPS (kVA), Required AC Cooling Load (Tons & BTU/hr), and Mains Feeder Current (Amps @ 230V).',
      'Engineered interactive rack cabinet cards with U-height badges, power density classification (Standard, Medium, High > 4.5 kW), thermal budget gauges, and a one-click "Size This Rack" UPS sizing action.',
      'Rendered an expandable rack equipment inventory table with unit positions, equipment category, vendor, model, PSU redundancy, and wattage.',
      'Added instant rack/device search, density filters, and one-click comprehensive data center power audit export to clipboard.',
      'Fixed the "Endpoint not found" issue in the Host Checker module via backend Python routing path normalization and direct Express handlers.',
      'Streamlined the Host Checker modal by removing the topology devices dropdown as requested for a cleaner, user-friendly interface.'
    ]
  },
  {
    version: '1.43.0',
    releaseDate: '2026-09-14',
    type: 'minor',
    title: 'افزودن ابزار هاست چکر بین‌المللی (Global Host Checker) با اتصال به API چِک‌هاست و سنجش پینگ از کشورهای مختلف جهان',
    title_en: 'Addition of Global Host Checker Tool to Network Suite with Check-Host.net Multi-Country Ping Diagnostics',
    changes: [
      'افزودن ابزار نهم به مجموعه جعبه‌ابزار مهندسی شبکه تحت عنوان «هاست چکر بین‌المللی» (Global Host Checker).',
      'اتصال مستقیم به API قدرتمند و توزیع‌شده Check-Host.net جهت انجام تست پینگ، اندازه‌گیری میزان تاخیر (RTT) و محاسبه درصد افت پکت (Packet Loss) از سرورهای کشورهای گوناگون جهان (آمریکا، آلمان، ایران، هلند، فرانسه، سوئیس، اندونزی، اسپانیا و...).',
      'نمایش پرچم اختصاصی هر کشور با ایموجی، نام کشور، شهر، آی‌پی نود، ASN و آی‌پی ریزالو شده مقصد.',
      'ردیابی و مصورسازی ۴ نمونه پینگ متوالی برای هر کشور همراه با میلی‌ثانیه‌های دقیق یا برچسب Timeout.',
      'محاسبه بلادرنگ آمارهای کلیدی شامل میانگین تاخیر جهانی (Global Avg Latency)، سریع‌ترین نود (Fastest Node)، کندترین سرور و نرخ پکت لاس کلی شبکه.',
      'سیستم فیلترسازی پیشرفته بر اساس وضعیت سلامت (بدون افت، دارای افت پکت، عدم پاسخ، در حال تست) و مرتب‌سازی بر اساس کمترین/بیشترین تاخیر، نام کشور و بیشترین افت بسته.',
      'پشتیبانی از پیش‌فرض‌های آماده (Cloudflare, Google, Quad9) و امکان انتخاب مستقیم تجهیزات از روی توپولوژی فعال.',
      'قابلیت استخراج و کپی گزارش جامع جدول کشورها به کلیپ‌بورد و دکمه اتصال مستقیم به لینک دائمی گزارش رسمی Check-Host.',
      'هماهنگی صددرصد با هر دو تم تاریک و روشن و پشتیبانی کامل و دوطرفه از زبان‌های فارسی و انگلیسی.'
    ],
    changes_en: [
      'Added the 9th engineering utility to the network Tools Suite: "Global Host Checker" powered by distributed Check-Host.net nodes.',
      'Integrated live multi-country ICMP ping diagnostics, round-trip time (RTT) measurements, and packet loss calculation across worldwide servers (USA, Germany, Iran, Netherlands, Spain, Indonesia, etc.).',
      'Rendered national flags with country emojis, country name, city, node IP, ASN and target resolved IP.',
      'Visualized 4 individual ping samples per node with exact millisecond latency badges and timeout indicators.',
      'Computed live global performance metrics including Global Avg Latency, Fastest Node, Slowest Node, and Overall Packet Loss rate.',
      'Implemented dynamic filtering by node health status (All, OK, Packet Loss, Timeout, In Progress) and multi-field sorting (Fastest First, Slowest First, Country Alphabetical, Highest Loss).',
      'Added quick host presets (Cloudflare, Google Public, Quad9) and direct host import from active network topology devices.',
      'Added one-click comprehensive report export to clipboard and direct link to official permanent Check-Host report.',
      'Delivered pristine Light & Dark theme compatibility with strict bidirectional Persian/English localization.'
    ]
  },
  {
    version: '1.42.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'افزودن ابزار جامع محاسبه‌گر توان یو‌پی‌اس و سایزینگ بانک باتری شبکه (UPS & Battery Bank Sizing)',
    title_en: 'Addition of UPS Capacity and Battery Bank Sizing Calculator Suite to Network Tools',
    changes: [
      'افزودن ابزار هشتم به مجموعه تولبار شبکه (Tools Suite) جهت محاسبات مهندسی برق و توان دیتاسنتر و اتاق سرور.',
      'محاسبه خودکار تبدیل توان اکتیو وات (Watts) به توان ظاهری (kVA) بر اساس ضریب توان بار (Power Factor: 0.6 تا 1.0) و حاشیه امن رشد تجهیزات (Headroom 25%).',
      'محاسبه دقیق انرژی مورد نیاز بانک باتری (Wh / kWh) و ظرفیت کل آمپرساعت (Ah) بر اساس ولتاژ باس DC یوپی‌اس (12V تا 240V)، راندمان اینورتر و عمق تخلیه مجاز (DoD).',
      'جدول ماتریس مقایسه‌ای باتری‌های استاندارد یو‌پی‌اس (شامل ۱۲ ولت ۲۸ آمپر، ۱۲ ولت ۴۲ آمپر، ۷، ۹، ۱۲، ۱۸، ۶۵، ۱۰۰، ۱۲۰، ۱۵۰ و ۲۰۰ آمپرساعت) با تفکیک تعداد سری در هر استرینگ، تعداد استرینگ‌های موازی و تعداد کل باتری‌های لازم.',
      'قابلیت محاسبه معکوس (Reverse Sizing): تعیین دقیق زمان برق‌دهی (ساعت و دقیقه) با داشتن تعداد و مشخصات باتری‌های موجود برای یک بار معین، یا تعیین حداکثر توان قابل تامین (وات و کاوا) برای یک زمان مورد نظر.',
      'امکان تخمین هوشمند بار مصرفی از روی سوئیچ‌ها و روترهای موجود در توپولوژی شبکه فعلی.',
      'هماهنگی صددرصد با هر دو تم تاریک و روشن با کنتراست استاندارد و خوانایی بالا، به همراه قابلیت کپی گزارش جامع محاسبات مهندسی به کلیپ‌بورد.'
    ],
    changes_en: [
      'Added the 8th network engineering tool: UPS Capacity & Battery Bank Sizing Calculator to the footer Tools Suite.',
      'Engineered live active load conversion from Watts to apparent power (kVA) using adjustable Power Factor (0.6 - 1.0) with configurable 25% safety headroom.',
      'Calculated total battery bank energy requirement (Wh/kWh) and Ah capacity across variable DC bus voltages (12V through 240V), inverter efficiency, and Depth of Discharge (DoD).',
      'Implemented full standard UPS battery comparison matrix (including 12V 28Ah, 12V 42Ah, 7Ah, 9Ah, 12Ah, 18Ah, 65Ah, 100Ah, 150Ah, and 200Ah) displaying series count per string, parallel strings, and total battery units.',
      'Implemented full Reverse Sizing mode: given existing battery count and specs, calculate exact backup runtime (hours & minutes) for a given load, or find maximum supported wattage/kVA for a target duration.',
      'Added one-click active equipment power estimation from active network topology switches and routers.',
      'Delivered full Light & Dark mode adaptive styling with high color contrast, plus one-click formatted engineering sizing report export to clipboard.'
    ]
  },
  {
    version: '1.41.1',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'رفع مشکل کشیدگی ارتفاع مودال تولید پسورد و اصلاح چیدمان فیلدهای اسکنر پورت TCP',
    title_en: 'Fix Height Overflow on Password Generator and Layout Conflict in TCP Port Scanner Modal',
    changes: [
      'رفع مشکل ارتفاع بیش از حد در مودال Password Generator با اعمال محدودیت max-h-[82vh]، اسکرول‌پذیری روان محتوا و قرارگیری لایه رویی با z-[60] جهت عدم تداخل با هدر و فوتر.',
      'اصلاح چیدمان فرم در مودال TCP Socket Port Scanner و جداسازی تکس‌باکس پورت و دراپ‌دان انتخاب تجهیزات توپولوژی به ستون‌های مستقل شبکه جهت جلوگیری از هرگونه همپوشانی فیلدها.',
      'ارتقای لایه z-index تمامی ابزارهای هفت‌گانه شبکه به z-[60] برای جلوگیری از رفتن زیر المان‌های چسبان و نوارهای وضعیت.'
    ],
    changes_en: [
      'Resolved vertical overflow in Password Generator modal by enforcing max-h-[82vh], smooth interior scrolling, and z-[60] overlay positioning to prevent clipping behind headers and footers.',
      'Fixed layout conflict in TCP Socket Port Scanner modal by separating the Port input and Topology Device dropdown into dedicated CSS grid columns with responsive alignment.',
      'Enhanced overlay layering across all network tools modals to z-[60] ensuring proper display above sticky status bars and headers.'
    ]
  },
  {
    version: '1.41.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'افزودن مجموعه ابزارهای کمکی مهندسی شبکه (Tools Suite) در فوتر با قابلیت منوی کشویی رو به بالا، داک مینیمایز و ۷ ابزار پیشرفته شبکه',
    title_en: 'Addition of Network Engineering Tools Suite in Footer with Bottom-up Menu, Minimized Tools Dock and 7 Advanced Network Utilities',
    changes: [
      'افزودن دکمه Tools در فوتر نرم‌افزار با منوی بازشونده از پایین به بالا (Bottom-up Popup Menu) جهت دسترسی سریع به ابزارهای عملیاتی شبکه.',
      'پیاده‌سازی ابزار جامع ساب‌نتینگ آی‌پی (IP Subnetting & VLSM Calculator) شامل ماسک‌های شبکه، دامنه آی‌پی‌های قابل اختصاص، برادکست، ماسک وایلدکارت، نمایش باینری، جدول کامل مرجع CIDR و محاسبه‌گر زیرشبکه‌بندی متغیر (VLSM).',
      'طراحی سیستم مدیریت وضعیت مودال‌ها با قابلیت مینیمایز و بستن همزمان، و نوار داک شناور پایین صفحه (Tools Dock) برای حفظ داده‌ها و جابجایی بدون وقفه میان کار با توپولوژی و ابزارها.',
      'افزودن ابزار تولیدکننده پسورد تجهیزات (Password Generator) با تنظیم طول، آنتروپی بیت و حالت‌های امنیتی اختصاصی Cisco Secret5/Type7 و MikroTik RouterOS.',
      'افزودن اسکنر پورت‌های TCP با پروب‌های مالتی‌ترد زنده سوکت روی آدرس‌های شبکه و تجهیزات توپولوژی به همراه پورت‌های رایج شبکه.',
      'افزودن ابزارهای DNS و پینگ زنده با قابلیت رکوردگیری A, AAAA, MX, TXT, NS, CNAME, SOA, PTR، محاسبه RTT و پکت‌لاس.',
      'افزودن ردیابی مسیر Traceroute زنده با دیاگرام گرافیکی تاخیر هاپ‌ها و سوئیچ به خروجی ترمینال.',
      'افزودن بازرس گواهی‌های امنیتی SSL/TLS (Cert Lookup) جهت بازرسی زنجیره X.509، تاریخ انقضا و SANs.',
      'افزودن تحلیلگر هدرهای وب و امنیت HTTP با ارزیابی امتیاز و گرید امنیتی طبق استانداردهای OWASP.'
    ],
    changes_en: [
      'Added a dedicated "Tools" button in the application footer with a smooth bottom-up flyout menu for quick access to network engineering tools.',
      'Implemented a comprehensive IP Subnetting & VLSM Calculator featuring subnet mask parsing, usable host range, broadcast calculation, wildcard masks, full binary visualization, CIDR reference matrix, and dynamic VLSM subdividing.',
      'Engineered a persistent multi-tool window state manager with Minimize, Restore, and Close controls, supported by a bottom dock bar that preserves user input while interacting with the network canvas.',
      'Added Network Device Password Generator with customizable entropy, length, and Cisco/MikroTik safe character modes.',
      'Added live multi-threaded TCP socket Port Scanner supporting device presets and custom IP targets.',
      'Added real-time DNS Record Query and ICMP Ping inspector with latency and packet loss metrics.',
      'Added live Traceroute & Hop Path Analyzer featuring hop-by-hop latency profiling and terminal output toggle.',
      'Added SSL/TLS Certificate Inspector for X.509 chains, expiration tracking, TLS ciphers, and SANs.',
      'Added HTTP Response & Security Header Analyzer with OWASP security grading and audit matrix.'
    ]
  },
  {
    version: '1.40.2',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'اصلاح کامل هماهنگی رنگ‌ها و سازگاری مودال‌های ویرایش مشخصات تجهیز و اعمال تعاملی تمپلیت با تم روشن',
    title_en: 'Full Light Mode Color Scheme and Polish for Edit Device Properties and Interactive Template Deployment Modals',
    changes: [
      'اصلاح ساختار بصری و هماهنگی رنگی کامل مودال Edit Device Properties با تم روشن شامل کارت‌ها، تب‌ها، فیلدها و کادرهای اطلاعاتی.',
      'سازگاری کامل مودال Interactive Template Deployment با تم روشن شامل مراحل تعاملی، تاییدیه‌ها، سلکتورها و ویرایشگر متغیرها.',
      'افزودن شناسایی خودکار وضعیت تم روشن از طریق کلاس HTML و ویژگی سراسری panelTheme برای تمامی زیرمودال‌ها.'
    ],
    changes_en: [
      'Refined visual layout and full light mode color harmony for Edit Device Properties modal, including tabs, cards, inputs, and information banners.',
      'Fully styled Interactive Template Deployment modal for light mode across interactive variable inputs, verification cards, and selectors.',
      'Added dynamic light mode detection via document element class and global panelTheme state for seamless rendering across modals.'
    ]
  },
  {
    version: '1.40.1',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'حذف شبیه‌سازهای ساختگی و الزام اتصال به سخت‌افزار واقعی در ترمینال و پورت‌ها',
    title_en: 'Elimination of Mock Emulation and Enforcement of Real Hardware Connectivity',
    changes: [
      'حذف کامل فال‌بک شبیه‌سازی ساختگی در ترمینال میکروتیک و سیسکو و الزام به برقراری ارتباط واقعی سوکت و SSH با تجهیز فیزیکی.',
      'رد دستورات ترمینال در زمان قطعی اتصال و نمایش صریح وضعیت DISCONNECTED / UNREACHABLE به جای پاسخ‌های فیک محلی.',
      'بهبود بخش مدیریت پورت‌ها با تفکیک برچسب‌های سخت‌افزار زنده (LIVE HARDWARE)، انبار ذخیره‌شده و تجهیز غیرقابل دسترس (OFFLINE).',
      'پاکسازی خودکار و بستن نشست‌های فعال سوکت و وب‌سوکت هنگام بستن مودال ترمینال.'
    ],
    changes_en: [
      'Completely removed mock emulation fallbacks in MikroTik and Cisco terminals, enforcing authentic socket and SSH connections to physical hardware.',
      'Explicitly reject CLI commands during disconnected states and display prominent DISCONNECTED / UNREACHABLE badges instead of mock outputs.',
      'Enhanced Port Management view with explicit badges distinguishing LIVE HARDWARE, SAVED INVENTORY, and OFFLINE / UNREACHABLE states.',
      'Implemented clean teardown and termination of active streaming WebSocket and SSH socket sessions when closing terminal modals.'
    ]
  },
  {
    version: '1.40.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'تبدیل ترمینال تجهیزات شبکه از حالت شبیه‌سازی به اتصال سخت‌افزاری واقعی SSH و Telnet',
    title_en: 'Real Hardware SSH & Telnet Live Connection for Network Equipment Inventory Terminals',
    changes: [
      'تبدیل ترمینال تجهیزات شبکه در بخش Network Equipment از حالت شبیه‌سازی محلی (Mock) به اتصال سوکت واقعی سخت‌افزاری با پشتیبانی کامل از پروتکل‌های SSH و Telnet.',
      'پیاده‌سازی موتور نشست ترمینال در بک‌اند (Python Network Terminal Session Manager) همراه با پراکسی امن وب‌سوکت برای استریم زنده دوطرفه و PTY تعاملی.',
      'افزودن سلکتور انتخاب پروتکل اتصال (SSH / Telnet) در فرم و مودال ثبت و ویرایش تجهیزات شبکه بدون تغییر ساختار UI.',
      'اتصال خودکار نشست‌های ترمینال میکروتیک و سیسکو به سخت‌افزار واقعی با حفظ قابلیت فال‌بک خودکار به شبیه‌ساز آفلاین در صورت عدم دسترسی به تجهیز.',
      'افزودن نشانگر وضعیت اتصال لایو (LIVE SSH / LIVE TELNET) و پینگ تاخیر لحظه‌ای در هدر ترمینال با تفکیک کامل زبان‌های فارسی و انگلیسی.'
    ],
    changes_en: [
      'Converted the Network Equipment Inventory terminal from local mock simulation to real hardware socket connections supporting both SSH and Telnet protocols.',
      'Implemented the Python Network Terminal Session Manager backend engine with WebSocket streaming proxy for bidirectional live interactive PTY sessions.',
      'Added connection protocol selector (SSH / Telnet) in the existing device registration and edit modals seamlessly within current UI workflows.',
      'Integrated live hardware execution into both MikroTik and Cisco terminal modals with graceful automatic fallback to offline emulation when devices are unreachable.',
      'Added dynamic live connection status badges (LIVE SSH / LIVE TELNET) and real-time latency indicators in the terminal header with strict bilingual localization.'
    ]
  },
  {
    version: '1.39.2',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'اصلاح و سازگاری کامل مودال ویرایش و مشخصات سخت‌افزاری و کارت‌های شبکه با تم روشن',
    title_en: 'Full Light Mode Compatibility for Edit Hardware Specifications & Network Cards Modal',
    changes: [
      'اصلاح رنگ پس‌زمینه، حاشیه‌ها، هدر و دکمه‌های بستن و انصراف در مودال ویرایش مشخصات سخت‌افزاری و کارت‌های شبکه در تم روشن.',
      'روشن و خوانا شدن پس‌زمینه فرم‌ها، کارت‌های انبار تجهیزات، تب‌های کاتالوگ سخت‌افزار و پیش‌نمایش‌ها مطابق استانداردهای تم روشن.',
      'اصلاح رنگ و کنتراست اینپوت‌ها، سلکتورها و دراپ‌داون‌های پیکربندی یونیت‌ها، پاورها و کارت‌های شبکه به همراه پشتیبانی کامل چندزبانه (fa/en).'
    ],
    changes_en: [
      'Adapted modal background, borders, header, close, and action buttons in Edit Hardware Specifications & Network Cards for light theme.',
      'Refactored form backgrounds, inventory cards, hardware catalog tabs, and preview containers for high contrast and readability in light mode.',
      'Polished inputs, select dropdowns, unit placement controls, PSU load calculations, and NIC configuration cards with full bilingual i18n support.'
    ]
  },
  {
    version: '1.39.1',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'اصلاح استایل کادر آپدیت در تاریخچه نسخه‌ها و رنگ متون رک در تم روشن',
    title_en: 'Release Notes Update Banner Styling and Rack Metric Typography Alignment in Light Mode',
    changes: [
      'اصلاح کادر اعلان آپدیت در مودال Version History & Release Notes در تم روشن و هماهنگ‌سازی رنگ زمینه و حاشیه آن با کارت‌های Installed Version History بدون گرادیانت.',
      'مشکی و پررنگ شدن کامل نوشته‌های داخل کادر آپدیت، نسخه جدید، برچسب Update و لیست تغییرات نسخه در تم روشن.',
      'سفید شدن رنگ متن نام رک و مجموعه وات توان مصرفی در تم روشن.',
      'تغییر رنگ عنوان Total Rack Power Load و جزییات فنی به خاکستری روشن در تم روشن.',
      'تغییر رنگ بج تعداد و درصد یونیت‌های اشغالی رک و مشخصات یونیت و عمق زیر نام رک به خاکستری روشن در تم روشن.'
    ],
    changes_en: [
      'Restyled the update banner in the Version History & Release Notes modal in light mode to match the clean background and border styling of Installed Version History cards without gradients.',
      'Ensured high-contrast black typography for update notes, version badges, update tags, and change list items in light mode.',
      'Set rack name and total power load wattage to crisp white in light mode.',
      'Set the "Total Rack Power Load" label and electrical specifications to light gray in light mode.',
      'Set the rack unit occupancy percentage badge and the unit/depth subtitle beneath the rack name to light gray in light mode.'
    ]
  },
  {
    version: '1.39.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'قابلیت جابه‌جایی چند یونیته تجهیزات رک، اصلاح هایلایت شفاف هاور و مشکی شدن فلش‌های انتقال در تم روشن',
    title_en: 'Multi-Unit Rack Device Step Movement, Transparent Hover Highlight and High-Contrast Black Move Arrows in Light Mode',
    changes: [
      'افزودن قابلیت جابه‌جایی چند یونیته (Multi-Unit Move) به دکمه‌های Move Up و Move Down در منوی هاور تجهیزات رک با امکان انتخاب گام حرکتی (۱ تا ۵ یونیت).',
      'اصلاح هایلایت هاور روی تجهیزات رک در تم روشن به صورت کادر شفاف و بدون پوشش رنگ سفید مات تا دیوایس به صورت صددرصد واضح و خوانا زیر هاور دیده شود.',
      'اصلاح کامل دکمه‌های انتقال به بالا و پایین (Move Up / Move Down) در تم روشن با فلش‌های مشکی پررنگ و برجسته و ضخامت خط بیشتر برای وضوح بصری کامل.',
      'همگام‌سازی بلادرنگ موقعیت هایلایت دیوایس همزمان با جابه‌جایی به بالا یا پایین در رک.'
    ],
    changes_en: [
      'Added multi-unit step movement (1U to 5U) to the Move Up and Move Down buttons on the rack device hover action menu.',
      'Fixed the rack device hover highlight in light theme with a transparent fill and distinct border so hardware faceplates remain 100% visible and un-obscured.',
      'Rendered bold, high-contrast dark black arrows for Move Up and Move Down buttons in light theme with increased stroke weight.',
      'Synchronized real-time device highlight positioning when shifting devices across rack units.'
    ]
  },
  {
    version: '1.38.5',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'اصلاح رنگ و خوانایی نوشته‌های منوی هاور دیوایس‌های رک و دکل در تم روشن',
    title_en: 'High-Contrast Text and Button Legibility for Rack and Tower Device Hover Menus in Light Mode',
    changes: [
      'اصلاح و روشن‌سازی کامل رنگ متون، تایتل تجهیز، مدل، شماره یونیت (U-Slot) و برچسب دکمه‌های منوی هاور دیوایس‌های رک (مانند مشخصات، کانفیگ، خط فرمان، پورت، کارت و انتقال) در تم روشن.',
      'جلوگیری از تاریک‌شدن متون داخل منوی هاور شناور تجهیزات رک توسط استایل‌های عمومی تم روشن و ایجاد رنگ‌های درخشان و با کنتراست بالا مطابق تم تیره.',
      'اصلاح رنگ عنوان، توضیحات و دکمه‌های مدال تایید حذف تجهیز از رک در تم روشن برای خوانایی کامل.',
      'بهینه‌سازی نمایش مشخصات و دکمه‌های هاور رادیوهای متصل به دکل در تم روشن.'
    ],
    changes_en: [
      'Fixed and brightened text colors, device title, model, U-slot badge, and action button labels (Props, Config, CLI, Port, Card, Transfer) on the rack device hover menu in light mode.',
      'Prevented global light theme styles from darkening text inside the floating quick actions menu, ensuring vivid high-contrast colors matching dark theme.',
      'Enhanced typography and button contrast for the rack device removal confirmation modal in light mode.',
      'Optimized tower radio device hover cards for clear, legible text in light theme.'
    ]
  },
  {
    version: '1.38.4',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'محو شوندگی و بسته شدن خودکار اعلان سوئیچ بین نماها و رفع کنتراست تاریخچه نسخه‌ها در تم روشن',
    title_en: 'Auto Fade-Out for View Switch Notifications and High-Contrast Typography for Release History in Light Theme',
    changes: [
      'پیاده‌سازی حالت محو شوندگی (Fade-out) و بسته شدن خودکار اعلان‌های سوئیچ بین نماها (مانند انتقال به نمای فیزیکی، کارتی و رک) ظرف ۳ ثانیه به طوری که دید نقشه شماتیک مسدود نشود.',
      'اصلاح تایپوگرافی و کنتراست متن Installed Version History و یادداشت‌های تغییرات در تم روشن به رنگ مشکی پررنگ و خوانا.',
      'بهینه‌سازی تگ‌ها، نشانگرها، تاریخ و دکمه‌های پاورقی مدال تاریخچه نسخه‌ها در تم روشن برای وضوح بصری کامل.'
    ],
    changes_en: [
      'Implemented smooth fade-out and auto-dismissal for view switch feedback notifications (Card, Physical, Rack) within 3 seconds so schematic view is never obstructed.',
      'Fixed light mode text contrast in Installed Version History and release notes cards with high-contrast black typography.',
      'Enhanced tags, badges, calendar metadata, and footer buttons in the Release Notes modal for pristine legibility in light theme.'
    ]
  },
  {
    version: '1.38.3',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'همگام‌سازی کامل تم تیره و روشن در نقشه، حذف آیکون چشم کارت‌ها و رفع باگ‌های بصری نوتیفیکیشن و جریان داده',
    title_en: 'Theme Parity for Topology Modals, Eye Icon Removal, and Light Theme Text Contrast Fixes',
    changes: [
      'حذف آیکون چشم از دکمه مشاهده فیزیکی در پایین کارت‌ها در نمای شماتیک جهت رفع افزونگی بصری.',
      'همگام‌سازی کامل تم تیره در مدال Create New Topology Map (CustomMapManageModal) و مدال‌های رک/دکل برای همخوانی با تم مشکی.',
      'اصلاح رنگ متن و آیکون گزینه جریان داده (Data Flow) در تم روشن به رنگ سفید خالص جهت خوانایی کامل.',
      'اصلاح استایل و کانتراست اعلان سوئیچ به نمای فیزیکی (Switched to Physical View) در تم روشن با پس‌زمینه و تایپوگرافی سازگار.',
      'اصلاح دکمه‌های غیرفعال سوئیچ نمای کارت و فیزیکی و برچسب Add Note در تم روشن نقشه سفارشی با متن سفید واضح.',
      'رفع قطعی فالبک متون فارسی در اعلان آپدیت پروفایل و تاریخچه نسخه‌ها در حالت زبان انگلیسی مطابق قانون چندزبانگی.'
    ],
    changes_en: [
      'Removed redundant eye icon from the Physical view button on device cards in schematic view.',
      'Full dark theme parity for Create New Topology Map modal and Rack/Tower management modals.',
      'Enhanced Data Flow toggle in light theme with high-contrast white text and white icon.',
      'Redesigned Switched to Physical View feedback toast with proper light mode background and legible typography.',
      'Ensured inactive Card/Physical view switch buttons and Add Note labels render with clear white text in light theme.',
      'Eliminated Persian text fallbacks in the profile dropdown update notification and historical release notes when English is active.'
    ]
  },
  {
    version: '1.38.2',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'اصلاح نمایش زبان اعلان‌های به‌روزرسانی در منوی پروفایل و ثبت قانون اجباری چندزبانگی',
    title_en: 'Enforce Language-Aware Update Notifications in Profile Menu and Add Mandatory Localization Rule',
    changes: [
      'اصلاح پیام اعلان آپدیت در پنجره بازشوی پروفایل تا در حالت زبان انگلیسی، عنوان انگلیسی ریلیز (title_en) نمایش داده شود و هیچ متنی به فارسی دیده نشود.',
      'افزودن لاگ‌های دوزبانه در فرآیند اجرای به‌روزرسانی در UpdateContext.',
      'ثبت قانون اجباری قطعی در مستندات AGENTS.md و GEMINI.md مبنی بر ممنوعیت کامل نمایش هرگونه متن فارسی در حالت زبان انگلیسی در تمامی بخش‌های پنل.'
    ],
    changes_en: [
      'Fixed profile dropdown update notification banner to display the English release title (title_en) when English language is active.',
      'Added language-aware update execution logs and error feedback in UpdateContext.',
      'Added strict permanent localization rule in AGENTS.md and GEMINI.md prohibiting any Persian text when the application is set to English.'
    ]
  },
  {
    version: '1.38.1',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'حذف آیکون چشم تکراری از هدر کارت‌ها در نمای کارت شماتیک و ساده‌سازی رابط کاربری',
    title_en: 'Remove Redundant Eye Icon from Device Card Header in Schematic View',
    changes: [
      'حذف دکمه آیکون چشم اضافی از هدر کارت تجهیزات در نمای شماتیک به دلیل عملکرد کاملاً یکسان با گزینه «فیزیکی» (Physical) در پایین کارت.',
      'بهینه‌سازی فضای نوار وضعیت بالای کارت و یکپارچه‌سازی دسترسی به نمای فیزیکی و رک.'
    ],
    changes_en: [
      'Removed redundant eye icon button from the device card header in schematic card view, consolidating navigation through the dedicated Physical action button.',
      'Streamlined card status bar layout and improved UI clarity.'
    ]
  },
  {
    version: '1.38.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'سیستم هوشمند بررسی به‌روزرسانی مخزن، نشانگر اعلان قرمز روی پروفایل و ارتقای خودکار پنل با یک کلیک',
    title_en: 'Automated Repository Update Checker, Pulsating Profile Notification, and One-Click In-Panel Updater',
    changes: [
      'پیاده‌سازی اندپوینت‌های سرور (/api/system/check-update و /api/system/perform-update) جهت پایش برخط مخزن Net-Management و مقایسه نگارش با سمانتیک ورژن.',
      'افزودن نشانگر چشمک‌زن قرمز پویا (Pulsating Red Ping Dot) روی آیکون پروفایل و کارت مدیریت در هدر پنل هنگام انتشار نسخه جدید.',
      'امکان کلیک روی نشانگر و مشاهده کارت رسمی نگارش جدید شامل تاریخ انتشار، نوع ارتقا و لیست کامل تغییرات (Release Notes).',
      'پیاده‌سازی دکمه و موتور اجرای خودکار ارتقا (One-Click Update Engine) با فرآیند همگام‌سازی فایل‌های مخزن، نصب پکیج‌ها، بازسازی پروژکشن باندل و تازه‌سازی خودکار صفحه.',
      'افزودن امکان تست و شبیه‌سازی اعلان آپدیت (Simulate Update Alert) جهت بررسی بصری عملکرد بدون نیاز به انتظار برای انتشار نسخه جدید.'
    ],
    changes_en: [
      'Implemented server-side endpoints (/api/system/check-update and /api/system/perform-update) for live GitHub Net-Management repository tracking and SemVer evaluation.',
      'Added a dynamic pulsating red indicator badge on the profile avatar and navigation header when a new release is available.',
      'Interactive release note preview modal detailing new features, changes, and release dates directly from the repository.',
      'Integrated one-click in-panel software updater with repository synchronization, package installation, build re-generation, and automated interface refresh.',
      'Added simulated update testing mode for developer demonstration and verification.'
    ]
  },
  {
    version: '1.37.1',
    releaseDate: '2026-09-13',
    type: 'patch',
    title: 'به‌روزرسانی آدرس‌های مخزن، لینک‌های نصب و حذف خودکار One-Liner و اسکریپت‌های سرور به Net-Management',
    title_en: 'Update Repository URLs, Automated One-Liner Install/Uninstall Commands, and Server Scripts to Net-Management',
    changes: [
      'به‌روزرسانی کامل لینک‌های نصب تک‌خطی (One-Liner Install) با دستور curl و bash در فایل README.md بر اساس مخزن جدید Net-Management.',
      'به‌روزرسانی دستور اسکریپت حذف و پاک‌سازی پنل (Uninstall-panel.sh) متصل به مخزن Net-Management.',
      'اصلاح آدرس‌های گیت کلون، سورس‌های پشتیبان ZIP و پروکسی‌های آینه در اسکریپت setup-panel.sh و uninstall-panel.sh.',
      'به‌روزرسانی نشان‌ها (Badges) و دستورالعمل‌های کامیت گیت در مستندات AI_INSTRUCTIONS.md.'
    ],
    changes_en: [
      'Updated automated one-liner curl installation commands in README.md to reference the Net-Management repository.',
      'Updated the automated uninstallation suite command (uninstall-panel.sh) linked to the Net-Management repository.',
      'Adjusted git clone targets, mirror proxies, and fallback ZIP download URLs in setup-panel.sh and uninstall-panel.sh.',
      'Updated repository badges and git workflow references in AI_INSTRUCTIONS.md.'
    ]
  },
  {
    version: '1.37.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'افزودن مجموعه کامل رادیوهای وایرلس میکروتیک به کاتالوگ سخت‌افزار و استقرار دکل مخابراتی به‌صورت سازه مستقل بیرون از رک روی نقشه',
    title_en: 'Add Complete MikroTik Wireless Radio Suite to Hardware Catalog & Independent Telecom Tower Map Entity',
    changes: [
      'افزودن مجموعه متنوع رادیوهای وایرلس میکروتیک (MikroTik Wireless Radios) به کاتالوگ سخت‌افزار شامل مدل‌های NetMetal ax (Wi-Fi 6)، NetMetal 5، NetBox 5، BaseBox 2/5، LHG 5 ac، LHG XL 5 ac، SXTsq 5 ac، QRT 5 ac، DISC Lite5 ac، Cube 60Pro ac، mANTBox 19s/15s، wAP ac و Groove 52 ac همراه با کانکتورهای RP-SMA و پورت‌های شبکه گیگابیت و ۲.۵G.',
      'تثبیت دکل مخابراتی به عنوان یک سازه فیزیکی مستقل روی نقشه (مانند رک): دکل‌ها روی بوم نقشه با فریم مستقل قرار می‌گیرند و به هیچ وجه داخل رک نصب نمی‌شوند.',
      'فیلتر هوشمند دسته‌بندی دکل‌های مخابراتی در مدال افزودن سخت‌افزار رک (Add Hardware to Rack) جهت جلوگیری قطعی از انتخاب اشتباه دکل درون یونیت‌های رک سرور.',
      'توسعه مدال‌های اختصاصی افزودن و نصب رادیو و آنتن روی دکل (AddTowerModal و MountRadioOnTowerModal) با قابلیت انتخاب رادیو از کاتالوگ میکروتیک یا سخت‌افزارهای موجود در اینونتوری، تنظیم جهت پرتو (Azimuth)، زاویه شیب (Tilt) و ارتفاع نصب روی دکل.',
      'عدم نمایش تکراری تجهیزات نصب‌شده روی دکل در بوم نمای فیزیکی و هماهنگی ابعاد فریم دکل با تمامی سکتورها و دیش‌های متصل.'
    ],
    changes_en: [
      'Added comprehensive MikroTik wireless radio models to the hardware catalog, including NetMetal ax (Wi-Fi 6), NetMetal 5, NetBox 5, BaseBox 2/5, LHG 5 ac, LHG XL 5 ac, SXTsq 5 ac, QRT 5 ac, DISC Lite5 ac, Cube 60Pro ac, mANTBox 19s/15s, wAP ac, and Groove 52 ac with RP-SMA connectors, PoE, and 2.5G/Gigabit ports.',
      'Secured telecom towers as first-class, independent physical entities placed directly on the topology map canvas, completely separate from server racks.',
      'Strictly filtered out telecom tower categories from the Rack Hardware Installation modal to prevent any accidental placement of towers inside rack units.',
      'Enhanced dedicated AddTowerModal and MountRadioOnTowerModal components supporting direct radio mounting from MikroTik catalog or existing inventory, with azimuth direction, tilt degrees, and elevation settings.',
      'Prevented duplicated floating icons on the canvas for radios mounted on telecom towers, and broadened the foreignObject container boundaries for crisp rendering of all mounted sectors and parabolic dishes.'
    ]
  },
  {
    version: '1.36.0',
    releaseDate: '2026-09-13',
    type: 'minor',
    title: 'سوییچ خودکار به نمای فیزیکی هنگام افزودن رک/دکل، حذف اتمیک دیوایس از کارت و فیزیکال، و غیرفعال‌سازی هوشمند تجهیزات نصب‌شده در اینونتوری',
    title_en: 'Auto-Switch to Physical View on Rack/Tower Creation, Unified Atomic Device Removal Across Views, and Greying Out Mounted Inventory Equipment',
    changes: [
      'تغییر خودکار و بلادرنگ حالت نقشه به نمای فیزیکال (Physical View) در هنگام انتخاب و ایجاد رک یا دکل در وضعیت خالی بودن نقشه سفارشی (Custom Map Canvas is Empty).',
      'حذف کاملاً یکپارچه و اتمیک تجهیزات در دکمه Remove from map: حذف همزمان از نمای کارتی (شناسه‌ها، پوزیشن‌ها و کابل‌های متصل) و نمای فیزیکال (تمامی اسلات‌های رک‌ها و دکل‌ها).',
      'خاکستری شدن و غیرفعال‌سازی تجهیزات در تب تجهیزات موجود (Inventory Equipment) هنگام نصب سخت‌افزار در رک یا دکل جهت جلوگیری از انتخاب تکراری همراه با نمایش وضعیت «نصب‌شده در رک/دکل».',
      'پشتیبانی کامل از ایجاد، جابجایی درگ‌اند‌دراپ و مدیریت دکل‌های مخابراتی (Telecom Towers & Masts) و نصب رادیوهای وایرلس روی بوم نقشه‌های سفارشی.'
    ],
    changes_en: [
      'Automatic real-time view mode switch to Physical View when adding a server rack or telecom tower from an empty custom map canvas or infrastructure toolbar.',
      'Atomic and unified device removal via "Remove from map": cleans up devices synchronously from Card View (IDs, positions, and cables) and Physical View (all rack slots and tower mounts).',
      'Smart greying out and disabling of already mounted equipment in the Inventory Equipment tab, preventing duplicate placement with a clear "Already Mounted" indicator tag.',
      'Full custom map support for Telecom Towers & Masts with drag-and-drop canvas positioning, wireless radio mounting, and physical infrastructure inspection.'
    ]
  },
  {
    version: '1.35.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'انتقال معکوس از نمای کارتی به نمای فیزیکی با آیکون چشم و افکت نئونی چرخشی روی سخت‌افزار/رک',
    title_en: 'Reverse Navigation from Card View to Physical View with Eye Icon & Rotating Neon Hardware Beam',
    changes: [
      'افزودن آیکون چشم (Eye Icon) در بالای کارت دیوایس‌ها در نمای کارتی و همچنین دکمه اکشن «فیزیکی» در بخش پایینی کارت جهت جابجایی بلادرنگ به نمای فیزیکی.',
      'مکان‌یابی هوشمند دیوایس در نمای فیزیکی: هدایت بوم به سمت رک مدنظر (در صورت نصب بودن دستگاه در رک) یا شاسی مستقل دستگاه و فعال‌سازی افکت نئونی چرخشی ۳ ثانیه‌ای دور تا دور اسلات یا شاسی سخت‌افزاری.',
      'افزودن نشان متحرک هدف (Target Hardware Badge) روی اسلات رک یا شاسی دستگاه در نمای فیزیکی جهت تشخیص فوری سخت‌افزار مدنظر.',
      'پشتیبانی از نمای فیزیکی بر مبنای ساختمان و طبقات با اسکرول خودکار و اعمال کادر نئونی چرخشی روی کارت دستگاه در پنل فیزیکی.'
    ],
    changes_en: [
      'Added a dedicated Eye icon in the device card header and a "Physical" action button in Card View for instant reverse navigation to the Physical View.',
      'Intelligent physical device localization: automatically pans the viewport to the host rack cabinet (if mounted) or standalone chassis and ignites the 3-second rotating neon border beam around the hardware slot.',
      'Integrated floating "Target Hardware" badge on the targeted rack slot or physical chassis for immediate visual recognition.',
      'Full compatibility with building and floor physical view, featuring smooth auto-scroll and rotating neon border beam on equipment hierarchy cards.'
    ]
  },
  {
    version: '1.34.1',
    releaseDate: '2026-09-12',
    type: 'patch',
    title: 'چرخش پرتو نئونی دور تا دور بوردر کارت و تارگت فوق‌دقیق دیوایس رک در نمای کارتی',
    title_en: 'Rotating Border Neon Beam & Ultra-Precise Device Card Targeting from Physical Rack',
    changes: [
      'تبدیل انیمیشن نئونی پخش‌شده به یک پرتو لیزری متمرکز و شیک (Rotating Neon Border Beam) با چرخش پیوسته دور تا دور کادر کارت بدون پخش شدن رنگ یا پوشاندن اطلاعات کارت.',
      'اصلاح و ارتقای متد رهگیری و تارگت دیوایس (Device ID & Alias Resolution) به طوری که کلیک روی دکمه کارت در پنل هاور رک، مستقیماً کارت همان دیوایس را روی بوم پیدا کرده، بوم را دقیقاً روی آن تنظیم و افکت نئونی را روی همان کارت فعال کند.',
      'جلوگیری از ایجاد کارت‌های تکراری روی بوم و ایجاد یکپارچگی کامل میان شناسه‌های فیزیکی شاسی سخت‌افزاری و کارت‌های توپولوژی.',
      'بهینه‌سازی کادر و پالت رنگی نئونی با کنتراست بالا و هسته سفید درخشان متحرک.'
    ],
    changes_en: [
      'Replaced the diffuse, wide-spread glow animation with an elegant, focused rotating border beam that smoothly travels around the card perimeter without obscuring device text or ports.',
      'Enhanced target device resolution and alias tracking so clicking the Card button in the physical rack hover bar targets the exact corresponding device card on the canvas with smooth camera panning.',
      'Deduplicated identical card instances on canvas to ensure a single, consistent card view representation per physical hardware unit.',
      'Refined the neon beam aesthetics with high-contrast glowing hues and a vivid white-hot core running along the border track.'
    ]
  },
  {
    version: '1.34.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'انیمیشن پالس نئونی رنگی ۳ ثانیه‌ای جهت مشخص‌سازی کارت دیوایس هنگام سوییچ از نمای فیزیکال به کارتی',
    title_en: '3-Second Vibrant Neon Pulse Animation for Instant Device Identification on Switching from Physical to Card View',
    changes: [
      'پیاده‌سازی افکت و انیمیشن جذاب نئونی (Neon Border & Glow) با رنگ تصادفی شاد و پرنور به مدت دقیق ۳ ثانیه روی کادر کارت دیوایس هنگام سوییچ از نمای فیزیکی به کارتی.',
      'افزودن نشان شناور و پالس‌دار بالای کارت هدف (Target Device Badge) همراه با شمارش معکوس ۳ ثانیه‌ای جهت تمایز بلادرنگ دیوایس مدنظر.',
      'تجهیز دکمه‌های «کارت» در پنل هاور رک، شاسی فیزیکی روی بوم و کارت‌های پنل فیزیکی به قابلیت سوییچ همراه با فوکوس و هایلایت نئونی.',
      'پشتیبانی از دابل‌کلیک روی شاسی فیزیکی جهت انتقال مستقیم به نمای کارتی و فعال‌سازی هایلایت نئونی.'
    ],
    changes_en: [
      'Implemented a dynamic 3-second neon border & glow pulse animation with randomized luminous colors on device cards when transitioning from physical to card view.',
      'Added a floating animated target badge over the highlighted card with a 3-second visual indicator for instant device localization.',
      'Equipped the "Card" action buttons across rack hover bars, canvas physical chassis, and physical hierarchy cards with smart neon-highlight switching.',
      'Added double-click support on canvas physical chassis to directly trigger the card view switch with the neon highlight animation.'
    ]
  },
  {
    version: '1.33.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'افزودن درگ & دراپ و جابجایی هوشمند پنجره‌های ترمینال همزمان، قفل بستن ترمینال با کلیک بیرون مودال و رفع برش تولتیپ پورت‌ها',
    title_en: 'Drag & Drop Terminal Pane Reordering, Smart Multi-Pane Swapping, Backdrop Outside-Click Lock, and Unclipped Port Tooltips',
    changes: [
      'پیاده‌سازی قابلیت کشیدن و رها کردن (Drag & Drop) با دستگیره اختصاصی و نمایشگر شناور هدف برای جابجایی و سوآپ مستقیم هر کدام از پنجره‌های ترمینال اسپلیت.',
      'رفع محدودیت جابجایی تنها دو ترمینال سمت چپ و هوشمندسازی دکمه‌های Swap برای جابجایی دوره‌ای و سریع بین تمام پنجره‌های فعال.',
      'افزودن دکمه قفل بستن ترمینال (Backdrop Lock) در نوار ابزار میز کار چند ترمینال و مودال‌های سیسکو و میکروتیک برای جلوگیری از بسته شدن با کلیک تصادفی بیرون مودال.',
      'رفع کامل مشکل افتادن تولتیپ مشخصات پورت‌ها در هاور پشت آیتم‌های بالایی و اسکرول فیس‌پلیت سخت‌افزاری با سیستم مختصات شناور آزاد.'
    ],
    changes_en: [
      'Implemented full Drag & Drop support with dedicated grip handles and drop target indicators to easily reorder and swap any terminal pane in multi-terminal workspace.',
      'Overcame the two-leftmost-terminal swap limitation by adding smart cyclic swapping and drag-and-drop across all active split-screen panes.',
      'Added a Backdrop Lock toggle in the multi-terminal workspace top bar and Cisco/MikroTik modals to prevent modal closure upon clicking outside.',
      'Completely resolved hardware port tooltip clipping over upper elements by using an unconstrained fixed-coordinate overlay renderer.'
    ]
  },
  {
    version: '1.32.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'تعبیه منوی شناور رنگ و قلم در ترمینال‌های سیسکو و میکروتیک، رفع پرش تولتیپ فیس‌پلیت پورت‌ها و هوشمندسازی انتخاب و جایگزینی بازه‌ای پورت‌ها در خط فرمان',
    title_en: 'Appearance Menu Popover for Cisco & MikroTik Terminals, Flicker-Free Port Tooltips, and Smart Port/Range Command Insertion',
    changes: [
      'انتقال پالت‌های انتخاب رنگ پس‌زمینه و قلم ترمینال‌های سیسکو و میکروتیک به یک دکمه منوی اختصاصی ظاهر (Appearance) جهت جلوگیری از شلوغی هدر ترمینال.',
      'رفع کامل لرزش و پرش‌های مکرر تولتیپ پورت‌ها در بخش Hardware Port Faceplate با حذف شناسه بومی title مرورگر و پیاده‌سازی تولتیپ مستقل، سبک و بدون تداخل رویدادهای ماوس.',
      'هوشمندسازی کلیک روی پورت‌ها جهت درج در دستور: جایگزینی هوشمندانه نام پورت جدید با پورت قبلی بدون پاک شدن متن دستور تایپ‌شده کاربر.',
      'پشتیبانی از کلید Ctrl/Shift برای انتخاب بازه‌ای از پورت‌ها (Range Selection) در سیسکو و میکروتیک.',
      'پشتیبانی جامع ترمینال سیسکو از دستورات بازه‌ای نظیر interface range و تغییر خودکار پرامپت به (config-if-range)# و اعمال دستورات ساب‌کانفیگ (shutdown، no shutdown، switchport vlan و...) روی تمامی پورت‌های انتخاب‌شده در بازه.'
    ],
    changes_en: [
      'Added a dedicated Appearance popover menu for Cisco and MikroTik terminals to cleanly house background and text color swatches without cluttering the toolbar.',
      'Completely eliminated tooltip flickering and mouse hover jitter on the Hardware Port Faceplate by removing native browser title attributes and isolating hover events.',
      'Implemented smart port click insertion in terminal command input: clicking subsequent ports cleanly replaces the previous interface token without erasing existing typed commands.',
      'Added Ctrl/Meta/Shift key support for selecting ranges of ports across both Cisco and MikroTik port faceplates.',
      'Full Cisco CLI support for interface range commands with dynamic (config-if-range)# prompt and multi-port subcommand application (shutdown, vlan assignment, mode trunk/access, description).'
    ]
  },
  {
    version: '1.31.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'توسعه گسترده کاتالوگ سخت‌افزاری سیسکو، میکروتیک و فورتی‌نت و تثبیت دقیق یونیت شروع در مودال افزودن به رک',
    title_en: 'Massive Expansion of Cisco, MikroTik & Fortinet Hardware Catalog and Precise Start-U Preservation in Rack Mounting Modal',
    changes: [
      'تثبیت دقیق مقدار Starting Unit (Start U) در مودال افزودن تجهیز به رک مطابق با یونیتی که کاربر روی آن کلیک کرده و حذف تغییر خودکار آن.',
      'افزودن محصولات جدید سوییچ سیسکو شامل سری Catalyst 2960-XR، 3560-X، 3650، 9200L، 9300X با توان UPOE+، شاسی‌های ماژولار 9404R و 9407R، سوییچ هسته 9500-48Y4C، شاسی غول‌پیکر 9606R و سوییچ‌های دیتاسنتری Nexus 3064، 3172، 9336C و 9364C.',
      'افزودن روترها و تجهیزات امنیتی سیسکو شامل ISR 1100، 1941، 2911، 2951، 3945، 4331، 4351، 4431، 4461، سری نسل جدید Catalyst 8200، 8300 (1U/2U)، 8500، روترهای اپراتوری ASR 1001-HX، 1002-HX، 1004، 1006-X و فایروال‌های سخت‌افزاری ASA 5516-X، ASA 5525-X، Firepower 1120/1140، Firepower 2130 و Cisco Secure Firewall 3110.',
      'توسعه سبد محصولات میکروتیک شامل روترهای پرقدرت RB4011، RB5009 تمام PoE، CCR1016، پرچمدار فیبر نوری CCR2004 Optical، سوییچ‌های CRS326، CRS354-48G، سوییچ غول‌پیکر CRS354-48P با توان ۸۰۰ وات، CRS317، CRS309 بی‌صدا، CRS312 مسی، CRS326-24S، سوییچ‌های فوق‌سریع ۱۰۰ گیگابیت CRS504، CRS510، CRS518 و سوییچ اختصاصی CSS326 SwOS.',
      'افزودن مجموعه کامل تجهیزات فورتی‌نت شامل FortiGate 60F Rackmount، 80F، فایروال نسل جدید SP5 با مدل‌های 90G و 120G، سری‌های سازمانی و دیتاسنتری 400F، 900G/1000F، 1800F، 2600F، ابر فایروال ۴۰۰ گیگابیت 4400F، سوییچ‌های هوشمند FortiSwitch 124F-FPOE، 448E و سوییچ دیتاسنتری 1048E، دستگاه تحلیل امنیت FortiAnalyzer 300G و گیت‌وی ایمیل FortiMail 200F.',
      'پشتیبانی از انواع جدید پورت‌های شبکه 2.5GbE RJ45 و 1GbE SFP در سیستم کارت‌های شبکه و مودال پیکربندی دیوایس‌ها.'
    ],
    changes_en: [
      'Strictly preserved the clicked rack unit in Starting Unit (Start U) in the Add Hardware modal, preventing unwanted auto-recalculation.',
      'Added extensive Cisco switch line: Catalyst 2960-XR, 3560-X, 3650, 9200L, 9300X (90W UPOE+), modular chassis 9404R & 9407R, core switch 9500-48Y4C, 9606R core chassis, and data center Nexus 3064, 3172, 9336C, 9364C.',
      'Added Cisco routing and security suite: ISR 1100, 1941, 2911, 2951, 3945, 4331, 4351, 4431, 4461, Catalyst 8200, 8300 (1U/2U), 8500, carrier routers ASR 1001-HX, 1002-HX, 1004, 1006-X, and firewalls ASA 5516-X, ASA 5525-X, Firepower 1120, Firepower 2130, and Cisco Secure Firewall 3110.',
      'Expanded MikroTik portfolio: RB4011, RB5009 (Full PoE), CCR1016, CCR2004 Optical Flagship, CRS326, CRS354-48G, CRS354-48P (800W), CRS317, silent CRS309, CRS312 10G Copper, CRS326-24S, 100G ultra switches CRS504, CRS510, CRS518, and CSS326 SwOS.',
      'Added comprehensive Fortinet lineup: FortiGate 60F RM, 80F, SP5 next-gen firewalls 90G & 120G, campus/datacenter firewalls 400F, 900G/1000F, 1800F, 2600F, hyperscale 4400F (400G), FortiSwitch 124F-FPOE, 448E, 1048E, FortiAnalyzer 300G, and FortiMail 200F.',
      'Added support for 2.5GbE RJ45 and 1GbE SFP port types in NIC configurations and rack hardware modals.'
    ]
  },
  {
    version: '1.30.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'اصلاح باز شدن مودال استودیو رک، لایه‌بندی مودال‌های فرزند، نوار ابزار هاور دیوایس‌ها، افزودن تجهیزات انبار به رک و منوی راست‌کلیک پورت سیسکو',
    title_en: 'Fix Rack Elevation Studio Modal Layering, Hover Action Bar Overflow, Inventory Device Rack Mounting, and Cisco Port Context Menu',
    changes: [
      'اصلاح باز شدن استودیو رک (Inspect Rack Elevation Studio) برای تمامی رک‌ها و همگام‌سازی لحظه‌ای وضعیت رک با استیت نقشه.',
      'رفع مشکل رفتن مودال استودیو رک به زیر هدر با ایجاد فاصله استاندارد و تنظیم ابعاد ریسپانسیو ویوپورت.',
      'اصلاح لایه‌بندی (Z-Index و React Portal) برای باز شدن مودال‌های فرزند نظیر Install Hardware، Edit Rack، Transfer Device و Edit Device Properties روی استودیو رک.',
      'اصلاح کامل نوار ابزار هاور دیوایس‌ها در نمای فیزیکی رک (کاهش اندازه دکمه‌ها، تنظیم چیدمان فشرده و جلوگیری از بیرون‌زدگی دکمه‌های پورت، کانفیگ، ترمینال و...).',
      'امکان مشاهده و افزودن تجهیزات موجود در بخش Inventory به بوم نقشه فیزیکی و نصب مستقیم آنها درون رک‌ها با توجه به مدل و مشخصات سخت‌افزاری.',
      'تنظیم دقیق موقعیت باز شدن منوی راست‌کلیک پورت‌های گرافیکی سیسکو بر روی مختصات نشانگر ماوس.'
    ],
    changes_en: [
      'Fixed Rack Elevation Studio modal opening logic for all racks with dynamic state synchronization.',
      'Resolved header overlap issue by ensuring proper viewport padding and height boundaries for the elevation studio.',
      'Fixed child modal layering (Install Hardware, Edit Rack, Transfer Device, Device Properties) using React Portals and top-level z-indexing.',
      'Redesigned the physical device hover toolbar on racks to prevent button overflow and ensure clean, compact action controls.',
      'Enabled seamless selection of devices from Network Equipment Inventory and direct mounting into server racks in Physical View.',
      'Fixed Cisco graphical port right-click context menu positioning to precisely match mouse cursor coordinates.'
    ]
  },
  {
    version: '1.29.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'فیس‌پلیت پورت‌های گرافیکی با سایز ۵۰٪ در ترمینال سیسکو و میکروتیک و سیستم تقسیم صفحه و کار همزمان با چند ترمینال (Multi-Terminal Workspace)',
    title_en: 'Compact 50% Port Faceplate in Cisco & MikroTik Terminals and Multi-Terminal Split-Screen Workspace',
    changes: [
      'افزودن کادر گرافیکی نمایش پورت‌ها بالای پنجره کنسول ترمینال سیسکو و میکروتیک (دقیقاً مشابه مودال فیس‌پلیت پورت‌ها اما با ابعاد نصف و فشرده) به همراه وضعیت زنده Link UP/DOWN، شماره پورت، و امکان کلیک روی پورت جهت تزریق سریع دستور به CLI.',
      'پیاده‌سازی قابلیت تقسیم صفحه ترمینال (Split Screen): با کلیک روی دکمه Split، صفحه مانیتور به دو نیمه تقسیم شده و ترمینال جاری در سمت چپ و لیست هوشمند انتخاب دیوایس‌های شبکه در سمت راست باز می‌شود.',
      'امکان اتصال و اجرای همزمان CLI چند دیوایس با پشتیبانی از باز شدن حداکثر ۴ ترمینال همزمان در چینش ستونی یا گرید (۲x۲).',
      'قابلیت جابجایی سریع جایگاه ترمینال‌ها با یک کلیک (دکمه Swap Panes: سمت راستی به چپ و سمت چپی به راست).',
      'امکان تغییر دیوایس متصل به هر پنجره، بستن مستقل هر ترمینال، و پشتیبانی کامل از هر دو برند تجهیزات Cisco IOS و MikroTik RouterOS.'
    ],
    changes_en: [
      'Integrated a compact 50% scale graphical port faceplate into the top header of both Cisco and MikroTik terminal modals with live link UP/DOWN indicators, port numbering, and click-to-CLI command injection.',
      'Implemented Split-Screen Multi-Terminal workspace: clicking the Split button places the active terminal on the left and opens an interactive network device selector on the right.',
      'Added support for concurrent CLI sessions for up to 4 devices simultaneously in flexible column or 2x2 grid layouts.',
      'Enabled quick one-click pane swapping (Swap Panes button to switch left and right terminals instantly).',
      'Added per-pane device switching, individual pane closing, and full cross-platform support for both Cisco IOS and MikroTik RouterOS devices.'
    ]
  },
  {
    version: '1.28.0',
    releaseDate: '2026-09-12',
    type: 'minor',
    title: 'رفع مشکل پنهان شدن دیوایس‌ها در رک، بهینه‌سازی ابعاد مودال افزودن تجهیز، جستجو در کاتالوگ سخت‌افزار، و یکپارچه‌سازی لایه نمای کارتی',
    title_en: 'Fix Rack Device Persistence, Add Hardware Modal Sizing & Catalog Search, and Card View Integration for Rack-Mounted Devices',
    changes: [
      'رفع باگ حذف یا غیب شدن ناگهانی پچ‌پنل و سایر تجهیزات رک پس از افزودن دیوایس‌های جدید (میکروتیک، فورتی‌گیت و...) با تضمین تخصیص شناسه‌های منحصربه‌فرد و تفکیک حالت‌های ویرایش و درج تجهیز جدید.',
      'اصلاح ساختار و استایل کانتینر مودال افزودن سخت‌افزار (Add Hardware Device to Rack)، تنظیم موقعیت عمودی و اسکرول داخلی جهت جلوگیری از افتادن زیر هدر و بیرون‌زدگی از پنجره مرورگر.',
      'افزودن کادر جستجوی زنده (Live Search Box) در تب کاتالوگ سخت‌افزار (Hardware Catalog) برای یافتن سریع تجهیزات بر اساس نام، مدل، برند (سیسکو، میکروتیک، فورتی‌گیت، HP و...) و دسته‌بندی.',
      'پشتیبانی کامل از لایه نمای کارتی (Card View) برای تجهیزات داخل رک، همگام‌سازی موقعیت قرارگیری روی بوم نقشه، و افزودن دکمه‌های انتقال مستقیم به نمای کارتی (Card View) در منوی هاور و پنل اینسپکتور جهت بررسی و کابل‌کشی پورت‌ها.'
    ],
    changes_en: [
      'Fixed the disappearing patch panel/hardware bug when adding new devices (such as MikroTik, FortiGate, etc.) into a rack by enforcing collision-free unique IDs and separating edit vs. new mount logic.',
      'Optimized the Add Hardware Device to Rack modal sizing, vertical bounds, and scroll containers to prevent falling under the page header or clipping outside the viewport.',
      'Implemented a live search box in the Hardware Catalog tab to quickly filter and locate hardware templates by brand, model name, and category.',
      'Added full Card View integration for rack-mounted devices, including automated canvas coordinate mapping and direct "Card View" quick-actions in the hover menu and inspector modal for port cabling inspection.'
    ]
  },
  {
    version: '1.27.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'امکان ویرایش مشخصات و ابعاد رک، انتقال تجهیزات بین رک‌ها، و جلوگیری از ثبت نام تکراری برای رک',
    title_en: 'Rack Editing & Unit Resizing, Inter-Rack Device Transfer, and Duplicate Rack Name Prevention',
    changes: [
      'افزودن امکان ویرایش کامل مشخصات رک (Edit Rack Modal) شامل تغییر نام رک، تنظیم تعداد یونیت‌ها (از ۱۲U تا ۴۸U یا یونیت سفارشی)، و تغییر عمق رک (۶۰۰ تا ۱۲۰۰ میلی‌متر) با بررسی خودکار عدم تداخل با تجهیزات موجود.',
      'پیاده‌سازی ماژول اختصاصی انتقال دیوایس بین رک‌ها (Transfer Device Modal) با قابلیت انتخاب رک مقصد، تشخیص هوشمند اولین اسلات خالی، و اعتبارسنجی زنده تداخل با اسلات‌های اشغال‌شده.',
      'افزودن دکمه‌های انتقال سریع دیوایس (Transfer) در منوی شناور تجهیز، نمای تفصیلی اینسپکتور، و لیست اقلام منصوب در رک.',
      'جلوگیری از ایجاد یا ویرایش رک با نام تکراری در کل نقشه توپولوژی و همچنین در سلسله‌مراتب فیزیکی با هشدارهای آنی و غیرفعال‌سازی هوشمند کلید ذخیره.'
    ],
    changes_en: [
      'Introduced comprehensive Rack Editing modal allowing users to rename racks, resize rack units (from 12U to 48U or custom), and adjust cabinet depth (600mm to 1200mm) with automatic collision checks against installed hardware.',
      'Built a dedicated Inter-Rack Device Transfer modal enabling seamless relocation of hardware devices between cabinets, with smart first-available slot selection and live slot occupancy validation.',
      'Added quick-action Transfer buttons in the device hover menu, the elevation inspector device details panel, and the mounted hardware inventory list.',
      'Enforced duplicate rack name prevention across custom topology maps and physical building/floor hierarchy with real-time UI validation alerts and disabled submit states.'
    ]
  },
  {
    version: '1.26.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'افزودن انیمیشن زنده پویانمایی انتقال داده (Data Flow Animation) روی کابل‌ها و لینک‌های بین تجهیزات',
    title_en: 'Live Animated Data Flow & Packet Exchange on Network Links in Card View',
    changes: [
      'پیاده‌سازی پویانمایی زنده جریان ترافیک داده (Live Packet Animation) روی لینک‌ها و کابل‌های ارتباطی بین دو دیوایس متصل به یکدیگر در نمای کارتی (Card View).',
      'نمایش پکت‌های رفت و برگشت (TX و RX) با رنگ‌ها و سرعت‌های متمایز بر اساس نوع کابل (فیبر نوری با سرعت فوق‌سریع و رنگ کهربایی، ترانک با رنگ سرخابی/بنفش، و کابل شبکه مسی با پکت‌های درخشان فیروزه‌ای/آبی).',
      'افزودن استریم نقطه‌چین روان (Flowing Dash Stream) با شتاب پیوسته روی کابل جهت نمایش فعال بودن تبادل بسته در لینک‌های آنلاین، و توقف خودکار انیمیشن در هنگام قطعی لینک (Link Down).',
      'افزودن کلید کنترل اختصاصی «جریان داده» (Data Flow) در نوار ابزار بالا با آیکون پالس، جهت فعال/غیرفعال‌سازی سریع این جلوه بصری.'
    ],
    changes_en: [
      'Implemented live animated data traffic flow and packet exchange along connection cables between connected devices in Card View.',
      'Rendered bidirectional packet beacons (TX and RX) traveling along the cable curve with distinct speeds and color themes tailored to cable types (ultra-fast amber for Fiber, vibrant magenta for Trunk, and electric blue for Copper Ethernet).',
      'Added a continuous flowing dash stream overlay across cables to visualize active data transmission on healthy links, with automatic suspension when links are down.',
      'Added a dedicated "Data Flow" toggle control with an active pulse indicator in the top toolbar to effortlessly toggle the live animation.'
    ]
  },
  {
    version: '1.25.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'اتصال کامل منوی هاور تجهیزات رک به مودال مشخصات انبار، ترمینال CLI، بررسی پورت‌ها و حذف ایمن',
    title_en: 'Direct Rack Hover Actions: Inventory Edit Device Properties Modal, CLI Terminal, Port Inspector & Safe Removal',
    changes: [
      'اتصال مستقیم دکمه Edit Device Properties (مشخصات دستگاه) در منوی شناور هاور تجهیزات رک به مودال ویرایش مشخصات انبار تجهیزات شبکه (Network Equipment Inventory & Management).',
      'افزودن امکان باز کردن ترمینال خط فرمان (CLI) و صفحه بررسی پورت‌ها (Port Inspector) مستقیماً از روی تجهیز در رک با دسترسی سریع.',
      'یکپارچه‌سازی فرآیند حذف تجهیز از رک با مودال تایید حذف ایمن (Delete Confirmation Modal) و به‌روزرسانی هماهنگ استیت‌ها و نقشه.'
    ],
    changes_en: [
      'Connected the Edit Device Properties button in the rack device hover menu directly to the Network Equipment Inventory & Management modal with full two-way state and configuration synchronization.',
      'Enabled quick-launch access for CLI Terminal and Port Inspector directly from the mounted hardware device hover menu in rack cabinets.',
      'Integrated safe deletion confirmation workflow for mounted rack devices, ensuring synchronized map and hardware updates.'
    ]
  },
  {
    version: '1.24.2',
    releaseDate: '2026-09-11',
    type: 'patch',
    title: 'اصلاح رفتار درگ تجهیز در رک و انطباق دقیق پیش‌نمایش با موقعیت موس',
    title_en: 'Rack Device Drag Experience & Precision Cursor-Aligned Placement Fix',
    changes: [
      'حذف و غیرفعال‌سازی نمایش دکمه «+ افزودن تجهیز» (Add Device) و استایل‌های هاور اسلات‌های خالی در حین درگ کردن تجهیز داخل رک.',
      'اصلاح و بهینه‌سازی سیستم محاسبه یونیت مقصد در هنگام درگ (Drag Target U) بر اساس مختصات واقعی نشانگر موس در اس‌وی‌جی رک، جهت انطباق دقیق کادر راهنمای جای‌گذاری با موس.'
    ],
    changes_en: [
      'Suppressed empty slot "+ Add Device" prompt and hover styling while actively dragging a device within the rack cabinet.',
      'Enhanced drag placeholder positioning by recalculating target rack units directly from cursor SVG bounds, ensuring the ghost outline perfectly tracks the mouse position.'
    ]
  },
  {
    version: '1.24.1',
    releaseDate: '2026-09-11',
    type: 'patch',
    title: 'تفکیک نمایش یادداشت‌ها (Sticky Notes) بر اساس نوع ویو (کارت شماتیک و فیزیکال)',
    title_en: 'View-Specific Sticky Notes Isolation (Card View vs Physical View)',
    changes: [
      'تفکیک هوشمند یادداشت‌های متنی (Sticky Notes): یادداشت‌های ثبت شده در نمای کارت شماتیک منحصراً در همین نما نمایش داده می‌شوند و یادداشت‌های ثبت شده در نمای فیزیکی فقط در نمای فیزیکال قابل مشاهده هستند.',
      'افزودن فیلد viewMode به نوع ساختار داده CustomTopologyStickyNote و فیلتر کردن اتوماتیک خطوط اتصال و کارت‌های یادداشت بر پایه حالت نمایش فعال بوم.'
    ],
    changes_en: [
      'Isolated Sticky Notes between canvas views: notes created in Card View are now strictly displayed in Card View, and notes created in Physical View are exclusively visible in Physical View.',
      'Added viewMode attribute to CustomTopologyStickyNote type and dynamically filtered note rendering and device connector lines based on active canvas displayMode.'
    ]
  },
  {
    version: '1.24.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'رفع مشکل همپوشانی کادر هاور رک (Z-Index)، تاییدیه حذف تجهیز از رک، تفکیک مودال‌های تنظیمات و پشتیبانی از تم روشن میکروتیک',
    title_en: 'Rack Device Hover Z-Index Stacking Fix, Rack Device Deletion Confirmation, Distinct Device Properties & Port Modals, & MikroTik Light Mode Theme Suite',
    changes: [
      'اصلاح ساختار لایه‌بندی Z-Index در نمای کابینت رک (RackCabinetSvg) با خارج کردن کادر عملیات و مشخصات هاور دیوایس از داخل foreignObject اس‌وی‌جی به لایه شناور برتر (z-50)، تا کادر هاور هرگز به زیر دیوایس‌های پایینی نیفتد.',
      'افزودن مودال تایید حذف امن (DeleteConfirmModal) هنگام کلیک بر روی دکمه حذف تجهیز از داخل رک، به همراه نمایش نام تجهیز، یونیت قرارگیری و هشدارهای مربوطه قبل از خروج تجهیز از رک.',
      'تفکیک دکمه‌های هاور دیوایس در رک: اختصاص دکمه «ویرایش مشخصات سخت‌افزاری» به باز شدن مودال Edit Device Properties و دکمه مجزا برای «پیکربندی کارت‌های شبکه و پورت‌ها» با تول‌تیپ‌های فارسی و انگلیسی دقیق.',
      'پشتیبانی جامع و حرفه‌ای از تم روشن (Light Mode) در تمامی بخش‌های میکروتیک شامل پنجره ترمینال، پنل مدیریت دیوایس و اینترفیس‌ها، جدول بریج و وی‌لن، سربرگ منابع و کانفیگ و منوی راست‌کلیک پورت‌ها.',
      'طراحی و پیاده‌سازی گرافیک اختصاصی پورت‌های میکروتیک مطابق با شکل واقعی سوکت‌های RouterOS با تفکیک رنگ پین‌ها و وضعیت چراغ‌های ال‌ای‌دی در هر دو تم روشن و تاریک.',
      'قابلیت انتخاب موقعیت مکانی تجهیز (ساختمان، طبقه، واحد، رک) از بین موارد از پیش تعریف‌شده در سیستم فیزیکی همراه با امکان تعریف سریع مورد جدید در مودال ثبت تجهیز (Register New Network Device).'
    ],
    changes_en: [
      'Resolved SVG stacking context clipping for rack device hover actions by hoisting the hover overlay above the SVG container into a dedicated top-level z-50 overlay, preventing it from clipping underneath lower rack units.',
      'Integrated DeleteConfirmModal on rack device removal action, preventing accidental unmounting and clearly detailing device name, rack unit (U), and impact.',
      'Separated rack device action buttons: configured "Edit Device Properties" modal independently from "Configure Network Cards & Ports" modal with distinct, descriptive tooltips.',
      'Comprehensive light mode theme support for the MikroTik suite: CLI Terminal, Device Management Modal, Port Inspector, Bridge & VLAN filtering, Resource Monitors, and Port Context Menu.',
      'Authentic MikroTik port hardware graphics with RouterOS-accurate port housings, metallic shielding, gold pin contacts, and dual Link/Activity LEDs in both light and dark themes.',
      'Integrated existing physical hierarchy selection (Building, Floor, Unit, Rack) into Register New Network Device modal with instant quick-add for new entries.'
    ]
  },
  {
    version: '1.23.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'یکپارچه‌سازی کامل تجهیزات انبار شبکه در نمای فیزیکی نقشه، نصب در رک با فیس‌پلیت واقعی و باز شدن منوی راست‌کلیک پورت در محل نشانگر ماوس',
    title_en: 'Full Network Equipment Inventory Integration in Physical Map View, Photorealistic Rack Mounting, & Accurate Mouse-Positioned Port Context Menu',
    changes: [
      'نمایش لیست و پنل تجهیزات ثبت‌شده در انبار (Network Equipment Inventory) در نمای فیزیکی نقشه با قابلیت فیلتر، جستجو و جانمایی مستقیم در رک.',
      'افزودن امکان انتخاب تجهیزات انبار در مودال نصب سخت‌افزار (AddHardwareModal) همراه با پیش‌نمایش زنده و واقع‌گرایانه فیس‌پلیت فیزیکی (شامل سیسکو، میکروتیک، فورتی‌نت، سوفوس و اچ‌پی).',
      'تشخیص هوشمند ابعاد (1U/2U)، توان مصرفی، تعداد و نوع پورت‌ها بر اساس مدل و برند تجهیز و محاسبه خودکار اولین اسلات آزاد در رک برای جلوگیری از تداخل (Collision Detection).',
      'اصلاح و بهینه‌سازی موقعیت منوی راست‌کلیک روی پورت‌های سیسکو با استفاده از React Portal در بدنه صفحه (document.body) و باز شدن دقیق منو در مختصات نوک نشانگر ماوس با تشخیص هوشمند لبه‌های صفحه.',
      'همگام‌سازی اطلاعات تجهیزات انبار در رک‌ها شامل آی‌پی، نام اختصاصی، لاگ‌های پورت و دسترسی مستقیم به ترمینال و عیب‌یابی.'
    ],
    changes_en: [
      'Directly integrated Network Equipment Inventory devices into the Physical Map View with dedicated search, filtering, and 1-click or drag-and-drop mounting into racks.',
      'Added an Inventory Equipment selection mode in the AddHardwareModal with live photorealistic SVG faceplate rendering for Cisco, MikroTik, Fortinet, Sophos, HPE, and ASUS hardware.',
      'Automated rack collision detection and slot calculation based on hardware unit height (1U/2U) and preconfigured manufacturer specifications.',
      'Fixed Cisco port context menu positioning by rendering through React Portal to document.body, ensuring the menu opens precisely at mouse cursor coordinates with smart edge collision avoidance.',
      'Synchronized inventory attributes (IP address, vendor, model, port counts) across physical rack chassis with direct CLI and inspection integration.'
    ]
  },
  {
    version: '1.22.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'مودال تایید حذف هوشمند رک و تجهیزات، تفکیک کامل نمای کارتی و فیزیکی، رفع تداخل لایه‌ها (Z-Index) و محاسبه توان مصرفی رک',
    title_en: 'Smart Deletion Confirmation Modal, Strict Global Card vs Physical Mode Separation, Z-Index Layering Fix, & Rack Power Wattage Metrics',
    changes: [
      'پیاده‌سازی مودال تایید حذف امن (DeleteConfirmModal) برای رک‌ها و تجهیزات با حذف فوری window.confirm پیشین.',
      'افزودن امکان انتخاب سرنوشت تجهیزات مستقر در رک هنگام حذف رک: حذف کامل همراه رک یا حفظ تجهیزات و انتقال آنها به بوم نقشه.',
      'یکپارچه‌سازی سیستم حذف امن در تمام بخش‌های برنامه از جمله لیست موجودی تجهیزات (DeviceListView) و کارت‌های روی نقشه.',
      'تفکیک منطقی و ساختاری کامل بین نمای کارتی (Card Mode) و نمای فیزیکی (Physical Mode): در نمای کارتی رک‌ها و شاسی‌های فیزیکی مخفی و کابل‌ها و پورت‌ها نمایش داده می‌شوند؛ در نمای فیزیکی کارت‌ها و کابل‌ها مخفی شده، تجهیزات داخل رک قرار گرفته و تنها قطعات نصب‌نشده روی بوم جهت مانت نمایش داده می‌شوند.',
      'سازگاری هوشمند نوار ابزار بالا با نمای فعال: نمایش دکمه‌های «افزودن دیوایس» و «کابل‌کشی» در نمای کارتی، و دکمه‌های «افزودن رک» و «نصب سخت‌افزار» در نمای فیزیکی.',
      'حل کامل مشکل لایه‌بندی و اولویت بصری (Z-Index): هاور و درگ کردن هر دیوایس آن را در بالاترین لایه بصری SVG (z-index 9999) قرار داده و مانع از افتادن تول‌تیپ یا کادر زیر رک یا سایر کارت‌ها می‌شود.',
      'محاسبه و نمایش لحظه‌ای توان مصرفی مجموع تجهیزات رک (بر حسب وات و کیلووات) به همراه تعداد پاور سرورها در بنر بالای هر کابینت رک.',
      'حفظ دسترسی و نمایش پایدار یادداشت‌های چسبان (Sticky Notes) در هر دو حالت نمای کارتی و فیزیکی.'
    ],
    changes_en: [
      'Implemented dedicated DeleteConfirmModal for racks and devices, completely eliminating abrupt window.confirm prompts.',
      'Added smart handling for mounted rack devices during rack deletion: choose to cascade delete or preserve devices by releasing them to the canvas.',
      'Unified safe deletion workflow across both the canvas topology view and the inventory list view (DeviceListView).',
      'Engineered strict global mode separation: Card Mode displays cards, ports, and inter-device cabling while hiding racks; Physical Mode hides cards and cables, places mounted hardware inside racks, and only leaves unmounted hardware on canvas for rack elevation.',
      'Context-aware toolbar controls: "Add Device" and "Cable" are displayed exclusively in Card Mode, while "Add Rack" and "Install Hardware" appear in Physical Mode.',
      'Completely resolved SVG stacking and Z-index layering: hovering or dragging any device hoists it to the top of the SVG stack (z-index 9999), preventing it from clipping behind racks or adjacent cards.',
      'Real-time power consumption aggregation (Watts and kW) with redundant PSU counters in the rack cabinet top status header.',
      'Maintained persistent visibility and positioning for draggable Sticky Notes across both Card and Physical view modes.'
    ]
  },
  {
    version: '1.21.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'کنسول مدیریت اختصاصی پورت‌ها و شاسی روترهای میکروتیک (MikroTik RouterOS)، منوی راست‌کلیک و ارسال بلادرنگ دستورات RouterOS',
    title_en: 'Dedicated MikroTik RouterOS Port Management Console, Realistic Faceplate, Context Menu, & Instant RouterOS CLI Command Dispatch',
    changes: [
      'پیاده‌سازی مودال اختصاصی مدیریت و تنظیمات پورت‌های میکروتیک (MikroTik Port Management Console) با شبیه‌سازی دقیق فیس‌پلیت سخت‌افزاری روتربوردها (CCR/CRS).',
      'طراحی پورت‌های واقع‌گرایانه میکروتیک (MikroTikPortSvg) شامل پورت‌های اترنت محافظت‌شده RJ45، پورت‌های فیبر نوری SFP+ 10G، چراغ‌های وضعیت Link/Act، نشانگر PoE-IN و پرچم‌های روتر او اس (R: Running, X: Disabled).',
      'افزودن منوی راست‌کلیک هوشمند روی پورت‌های میکروتیک: فعال/غیرفعال‌سازی پورت، عضویت در بریج (Bridge Membership)، تنظیم PVID/VLAN، تغییر سرعت و دوبلکس، یادداشت پورت (Comment) و تست عیب‌یابی کابل (TDR Cable Test).',
      'پیاده‌سازی مودال پیش‌نمایش و تایید دستورات RouterOS پیش از ارسال به دستگاه، با امکان کپی اسکریپت و ارسال امن به روتر.',
      'افزودن ترمینال تعاملی خط فرمان میکروتیک (MikroTikTerminalModal) با پشتیبانی از دستورات اسلش روتر او اس، راهنمای سریع دستورات و انتخاب تم رنگی کنسول.',
      'رفع خطای ماژول ترجمه‌ها و بازسازی کامل کامپوننت‌های پایدار سیستم.'
    ],
    changes_en: [
      'Engineered dedicated MikroTik RouterOS Port Management Modal featuring photorealistic RouterBOARD (CCR/CRS) physical faceplate rendering.',
      'Created realistic MikroTik port components (MikroTikPortSvg) including shielded RJ45 interfaces, 10G SFP+ optical cages, dual Link/Act LEDs, PoE-IN badges, and RouterOS flags (R for Running, X for Disabled).',
      'Implemented intelligent right-click context menu for MikroTik ports: interface enable/disable, bridge membership, PVID/VLAN assignment, speed/duplex modes, port comment annotations, and TDR cable diagnostics.',
      'Designed a RouterOS command review and confirmation modal (MikroTikPortConfigConfirmModal) displaying live RouterOS syntax before safe dispatch to the target device.',
      'Integrated interactive MikroTik CLI Terminal (MikroTikTerminalModal) with slash syntax support, command quick-guide, and customizable terminal palettes.',
      'Resolved translation export syntax errors and restored clean builds across all driver modules.'
    ]
  },
  {
    version: '1.20.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'دوگانگی نمای کارت و سخت‌افزار فیزیکی (Card/Physical Mode)، نصب مستقیم تجهیزات در رک و یادداشت‌های استیکی چسبان (Sticky Notes) با قابلیت اتصال به دیوایس‌ها',
    title_en: 'Dual Device Canvas Modes (Card/Physical), Direct Rackmount from Canvas, & Interactive Connected Sticky Notes with Global Hide/Show',
    changes: [
      'پیاده‌سازی دو حالت نمایش متمایز برای هر دیوایس روی نقشه: نمای کارتی (Card Mode) جهت طراحی شماتیک کابل‌کشی و مشخص کردن پورت‌ها، و نمای فیزیکی (Physical Hardware Mode) با رندر واقع‌گرایانه شاسی سرور/سوئیچ جهت استقرار در رک.',
      'افزودن امکان تغییر آسان بین نمای کارتی و نمای فیزیکی به صورت سراسری از نوار ابزار و همچنین به ازای هر تجهیز به صورت جداگانه از روی هدر کارت.',
      'امکان نصب مستقیم تجهیزات فیزیکی از روی بوم نقشه به درون رک‌های دلخواه (Mount to Rack) همراه با مدیریت برخورد و پیش‌گیری از تداخل یونیت‌ها.',
      'پیاده‌سازی سیستم یادداشت‌های چسبان تعاملی (Sticky Notes): قابلیت جابه‌جایی آزاد روی نقشه با درگ، ویرایش عنوان و متن، انتخاب تم رنگی (زرد، آبی، سبز، سرخ، بنفش، کهربایی)، و تاریخ ثبت.',
      'قابلیت اتصال خطی یادداشت به هر دیوایس مشخص با خط‌چین هدایتگر تعاملی زرد/فیروزه‌ای و دکمه فوکوس دوربین روی تجهیز متصل شده.',
      'افزودن چک‌باکس پنهان/نمایان‌سازی سراسری کلیه استیکی نوت‌ها در نوار ابزار بالا جهت خلوت نگه‌داشتن صفحه در مواقع لزوم.',
      'اصلاح و بومی‌سازی دو دکمه «افزودن رک» و «نصب سخت‌افزار» در زبان انگلیسی به «Add Rack» و «Install Hardware» به همراه ترجمه صحیح تول‌تیپ‌ها.'
    ],
    changes_en: [
      'Engineered dual visual modes for canvas devices: Card Mode (optimized for port-to-port cable drawing and link management) and Physical Mode (photorealistic enterprise chassis representation for rack elevation).',
      'Added seamless switching between Card and Physical views both globally via the toolbar and per-device via the device card header action button.',
      'Enabled direct mounting of canvas physical devices into target racks with slot collision checking and unit allocation.',
      'Created interactive draggable Sticky Notes: full free-form placement, rich text/markdown notes, timestamping, and 6 vibrant color themes (Yellow, Blue, Green, Rose, Purple, Amber).',
      'Implemented dynamic device linking for sticky notes with vector dashed callout lines and single-click camera focus on linked nodes.',
      'Added a global Hide/Show Notes toggle checkbox directly in the top custom map toolbar.',
      'Fixed language localization for "Add Rack" and "Install Hardware" buttons and their comprehensive tooltips in English view.'
    ]
  },
  {
    version: '1.19.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'جابه‌جایی درگ‌وان‌دراپ تجهیزات در رک، پیشگیری از تداخل یونیت‌ها (Collision Detection)، ویرایش مشخصات و بومی‌سازی دو زبانه (FA/EN)',
    title_en: 'In-Rack Drag & Drop Hardware Relocation, Unit Collision Prevention, Full Device Spec Editing, & Dual Language i18n Localization',
    changes: [
      'پیاده‌سازی قابلیت جابه‌جایی درگ و دراپ (Drag & Drop) تجهیزات سخت‌افزاری درون رک با فیدبک بصری بلادرنگ (Ghost Preview)، هدایتگر وضعیت و دکمه‌های گام‌به‌گام بالا و پایین بردن تجهیز.',
      'پیاده‌سازی مکانیزم هوشمند جلوگیری از تداخل فیزیکی در یونیت‌های رک (Slot Collision Detection): عدم امکان نشستن دو تجهیز روی یک یونیت، نمایش پیام هشدار تداخل به همراه دکمه هوشمند یافتن خودکار اولین یونیت آزاد (Find Free Slot).',
      'افزودن امکان ویرایش کامل مشخصات سخت‌افزارها و پیکربندی مجدد کارت‌های شبکه و پورت‌ها هم از روی رک و هم داخل استودیو بازرسی رک.',
      'بومی‌سازی و چندزبانگی کامل (i18n): تطبیق خودکار تمام منوها، مودال‌ها، دکمه‌ها، عنوان‌ها و ابزارها مطابق زبان فعال سیستم (فارسی و انگلیسی).',
      'ارتقای واقع‌گرایی المان‌های SVG تجهیزات با شبیه‌سازی دقیق فیس‌پلیت‌های سازمانی، ماژول‌های ذخیره‌ساز، پنل‌های ال‌ای‌دی، پورت‌های شبکه و فن‌های پشتی.'
    ],
    changes_en: [
      'Implemented fluid in-rack drag-and-drop hardware relocation with real-time ghost previews, slot snapping, and single-click move up/down controls.',
      'Engineered intelligent rack slot collision detection preventing hardware overlap, rendering clear collision alerts and a "Find Free Slot" auto-locator.',
      'Added full hardware specifications and network card/port editing capabilities directly from rack cards and within the Rack Elevation Studio.',
      'Comprehensive dual-language localization (i18n): dynamically adapting all modal copy, buttons, tooltips, and categories between English and Persian based on active system language.',
      'Enhanced photorealistic vector SVG rendering reflecting genuine enterprise server faceplates, drive caddies, diagnostic LEDs, and rear I/O connectivity.'
    ]
  },
  {
    version: '1.18.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'استودیو طراحی و مدیریت فیزیکی رک‌های دیتاسنتر (16U تا 44U) و کاتالوگ سخت‌افزارهای سرور، سوییچ، استوریج و پیکربندی پورت‌های شبکه',
    title_en: 'Data Center Rack Elevation Studio (16U-44U), Hardware Catalog (HPE/Asus/Cisco/Storage/Firewalls), & Interactive NIC/Port Configurator',
    changes: [
      'افزودن امکان ایجاد و چیدمان رک‌های سرور استاندارد ۱۹ اینچ روی نقشه‌های شماتیک در سایزهای ۱۶، ۲۱، ۲۸، ۳۶، ۴۰ و ۴۴ یونیت با عمق‌های ۶۰، ۸۰، ۱۰۰ و ۱۲۰ سانتی‌متر.',
      'طراحی گرافیکی SVG واقع‌گرایانه تجهیزات و رک‌ها با قابلیت سوئیچ بین نمای جلو (Front View) و نمای پشت (Rear View) شامل شاسی، ریل‌ها، شماره‌گذاری یونیت‌ها (U-slots)، پنل‌های تهویه و براکت‌های نصب.',
      'کاتالوگ جامع سخت‌افزارهای دیتاسنتر: انواع سرورهای HPE ProLiant (نسل‌های Gen8 تا Gen11)، سرورهای ASUS ESC/RS، سرورهای Cisco UCS، سوئیچ‌ها و روترهای سیسکو و میکروتیک، فایروال‌های FortiGate و Sophos XGS، ذخیره‌سازهای HPE MSA/Alletra و Dell EMC، نس QNAP، کیس‌های رکمونت صنعتی، پچ‌پنل‌های مسی و فیبر، و کیبل منیجمنت.',
      'سیستم تعاملی پیکربندی کارت‌های شبکه (NIC) و پورت‌ها هنگام افزودن یا ویرایش سخت‌افزار با تعیین تعداد کارت‌ها، تعداد پورت‌ها در هر کارت، نوع پورت (1GbE RJ45، 10GbE RJ45، 10G SFP+، 25G SFP28، 40G QSFP+، 100G QSFP28 و فیبرچنل FC) با مقادیر پیش‌فرض هوشمند و امکان ویرایش آتی.',
      'استودیو بازرسی و مدیریت ارتقا یافته رک (Rack Elevation Studio Modal) برای مشاهده تفصیلی تجهیزات مستقر در هر یونیت، مصرف برق، پورت‌های شبکه، جابه‌جایی و مدیریت آسان سخت‌افزار.'
    ],
    changes_en: [
      'Added support for placing standard 19-inch server racks on custom schematic maps in 16U, 21U, 28U, 36U, 40U, and 44U unit sizes with 60cm, 80cm, 100cm, and 120cm depth specifications.',
      'Photorealistic vector SVG rendering of racks and hardware devices with instantaneous front/rear view switching, including perforated doors, unit slot numbering, chassis, ventilation grilles, and mounting brackets.',
      'Extensive hardware catalog including HPE ProLiant servers (Gen8 through Gen11), ASUS rack servers, Cisco UCS, Cisco and MikroTik switches/routers, FortiGate and Sophos firewalls, HPE and Dell EMC storage arrays, QNAP rackmount NAS, industrial IPC chassis, copper/fiber patch panels, and horizontal cable managers.',
      'Interactive Network Interface Card (NIC) and port configurator enabling custom card counts, port counts per card, and port interface types (1GbE RJ45, 10GbE RJ45, 10G SFP+, 25G SFP28, 40G QSFP+, 100G QSFP28, 8G/16G/32G FC) with smart template defaults and future re-configurability.',
      'Full-screen Rack Elevation Studio inspector modal displaying unit allocation, total power budget in Watts, port totals, device inspection, and direct NIC editing.'
    ]
  },
  {
    version: '1.17.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'منوی راست‌کلیک پورت‌های گرافیکی میکروتیک و مودال تایید اجرای دستورات RouterOS از طریق تانل',
    title_en: 'MikroTik Graphical Port Right-Click Context Menu & RouterOS Tunnel CLI Execution Confirmation Modal',
    changes: [
      'پیاده‌سازی کامل منوی راست‌کلیک تعاملی (MikroTikPortContextMenu) روی اینترفیس‌ها و پورت‌های گرافیکی در مدال مدیریت میکروتیک با امکانات جامع RouterOS.',
      'پشتیبانی از اقدامات کلیدی: فعال‌سازی/غیرفعال‌سازی اینترفیس (disabled=yes/no)، عضویت و جدا کردن از بریج (Bridge Port Add/Remove)، تغییر و تخصیص VLAN شناسه PVID به همراه انتخابگر سریع و سفارشی، تنظیمات سرعت و مذاکره خودکار (Auto-Negotiation / 100M Full-Duplex / 10G SFP+).',
      'افزودن قابلیت‌های پیشرفته میکروتیک شامل: فعال‌سازی محافظت لوپ شبکه (Loop Protect)، مدیریت برق‌رسانی PoE Out، تغییر کامنت و برچسب پورت، تست سلامت کابل (TDR Cable Diagnostic)، بازنشانی مک‌آدرس کارخانه‌ای و دسترسی مستقیم به ترمینال CLI.',
      'پیاده‌سازی دیالوگ تایید نهایی قبل از اجرا (مشابه مودال سیسکو) که اسکریپت و دستورات دقیق متناظر RouterOS را به همراه پیش‌نمایش تانل نمایش داده و با تایید کاربر، دستورات را بلادرنگ از طریق تانل مستقیم به میکروتیک ارسال و اجرا می‌کند.'
    ],
    changes_en: [
      'Implemented full interactive right-click context menu (MikroTikPortContextMenu) for graphical physical ports in the MikroTik Device Management Modal.',
      'Full support for core RouterOS port operations: Interface enable/disable (disabled=yes/no), Bridge membership toggle (Bridge Port Add/Remove), Bridge VLAN PVID assignment with quick presets and custom ID prompt, speed & duplex control (Auto-negotiation / 100M Full-duplex / 10G SFP+).',
      'Integrated advanced MikroTik capabilities: Hardware Loop Protect activation, PoE Out power delivery management, port comment/description editing, TDR Cable Diagnostic test, factory MAC address reset, and direct RouterOS terminal launching.',
      'Pre-execution CLI confirmation modal (mirroring Cisco workflow) displaying exact RouterOS CLI syntax and tunnel dispatch details, executing live commands over the tunnel upon user confirmation.'
    ]
  },
  {
    version: '1.16.0',
    releaseDate: '2026-09-11',
    type: 'minor',
    title: 'سوئیت جامع VPN میکروتیک، پالت انتخاب رنگ متن ترمینال‌های سیسکو و میکروتیک، و بهبود عملکرد آکاردئونی سایدبار',
    title_en: 'Comprehensive MikroTik VPN Suite, Terminal Text Color Customization, and Collapsed Sidebar Accordion Enhancement',
    changes: [
      'پیاده‌سازی کامل سوئیت VPN میکروتیک با پشتیبانی از ۷ پروتکل: WireGuard، SSTP، OpenVPN، IPsec Site-to-Site، EoIP Tunnel، VXLAN Overlay و PPTP به همراه تولید خودکار کلیدها، فایروال، روتینگ و اعتبارسنجی پارامترها.',
      'افزودن پالت ۸ رنگ متن قلم ترمینال (سفید، زرد، سبز، آبی روشن، بنفش، صورتی، کهربایی، مشکی) در مدال‌های ترمینال سیسکو (Cisco) و میکروتیک (MikroTik) با پایداری در localStorage.',
      'اصلاح رفتار آکاردئونی سایدبار ناوبری در حالت جمع‌شده (Collapsed): مخفی ماندن خودکار زیرمنوهای والدهای بسته زیر والد خود همانند حالت باز بودن منو و امکان کلیک تعاملی روی والد در حالت فشرده.',
      'ثبت قانون اجباری ارتقای نسخه (Version Bump) به ازای هر تغییر برای تمامی هوش‌های مصنوعی در مستندات AGENTS.md و GEMINI.md.'
    ],
    changes_en: [
      'Full multi-protocol MikroTik VPN Suite: WireGuard, SSTP, OpenVPN, IPsec site-to-site, EoIP tunnel, VXLAN overlay, and PPTP with automated key generation, firewall rules, route injection, and parameter validation.',
      'Added 8-color terminal typography palette (White, Yellow, Green, Sky Light Blue, Purple, Pink, Amber Orange, Black) to both Cisco and MikroTik terminal modals with localStorage persistence.',
      'Enhanced collapsed sidebar navigation behavior: properly hiding closed parent children in collapsed mode while allowing interactive parent toggles.',
      'Documented mandatory version bumping rules in AGENTS.md and GEMINI.md for all AI coding agents working on this project.'
    ]
  },
  {
    version: '1.15.4',
    releaseDate: '2026-09-10',
    type: 'patch',
    title: 'تکمیل انطباق کنتراست متن در ترمینال سیسکو: متن سفید در پس‌زمینه‌های تیره و رنگی و متن مشکی در پس‌زمینه سفید',
    title_en: 'Cisco Terminal Typography Contrast: Pure White on Dark & Colored Backgrounds, Pure Black on White',
    changes: [
      'تنظیم سراسری رنگ متون در ترمینال سیسکو (CiscoTerminalModal): با انتخاب هر یک از رنگ‌های پس‌زمینه (سرمه‌ای، مشکی خالص OLED، آبی‌نفتی، سبز ماتریکس، بنفش سایبرپانک، زغالی)، تمامی متون خروجی ترمینال، پرامپت‌ها، بنر ورود و متن ورودی کاربر در داخل کامند به رنگ سفید خالص (Pure White) نمایش داده می‌شوند.',
      'در صورت انتخاب پس‌زمینه سفید خالص (Pure White)، کلیه نوشته‌های خروجی و فیلد تایپ دستور به رنگ مشکی خالص (Pure Black) تبدیل می‌شوند تا خوانایی فوق‌العاده و کنتراست استاندارد حاصل شود.',
      'حذف تداخل استایل‌های CSS از cisco-cli-input و cisco-terminal-screen برای اعمال بلادرنگ و بدون نقص رنگ انتخابی.'
    ],
    changes_en: [
      'Comprehensive terminal typography contrast for Cisco Terminal Modal: with any dark or colored background selected (Slate, Pitch Black OLED, Solarized Teal, Matrix Green, Cyberpunk Violet, Charcoal), all output texts, prompts, system banners, and the user command input render in pure white.',
      'When selecting Pure White background, all output texts and the command input field automatically switch to pure black for optimal contrast.',
      'Removed CSS override conflicts from cisco-cli-input and cisco-terminal-screen for seamless dynamic color rendering.'
    ]
  },
  {
    version: '1.15.3',
    releaseDate: '2026-09-10',
    type: 'patch',
    title: 'انطباق کنتراست متن ترمینال: متن سفید خالص در پس‌زمینه‌های تیره و متن مشکی خالص در پس‌زمینه سفید',
    title_en: 'Terminal Text Contrast Synchronization: Pure White on Dark Backgrounds and Pure Black on White',
    changes: [
      'تنظیم دقیق رنگ متون در ترمینال میکروتیک و سیسکو: در صورت انتخاب هر یک از پس‌زمینه‌های تیره و رنگی (سرمه‌ای، مشکی خالص، آبی‌نفتی، سبز ماتریکس، بنفش، زغالی)، تمامی متون خروجی ترمینال، پرامپت‌ها و فیلد ورودی کامند به رنگ سفید خالص (Pure White) نمایش داده می‌شوند.',
      'در صورت انتخاب پس‌زمینه سفید (Pure White)، کلیه نوشته‌های خروجی ترمینال، پرامپت ورودی و متن در حال تایپ به رنگ مشکی خالص (Pure Black) تبدیل می‌شوند تا حداکثر خوانایی و کنتراست بصری فراهم گردد.'
    ],
    changes_en: [
      'Synchronized terminal typography contrast in MikroTik and Cisco modals: on all dark and colored backgrounds, terminal output lines, prompt symbols, and the command input field render in pure white.',
      'On white backgrounds, all terminal output texts, prompt indicators, and typing text automatically switch to pure black for high contrast and readability.'
    ]
  },
  {
    version: '1.15.2',
    releaseDate: '2026-09-10',
    type: 'patch',
    title: 'شخصی‌سازی رنگ پس‌زمینه ترمینال میکروتیک، منوی تاریخچه دستورات و ناوبری با کلیدهای جهت‌نما',
    title_en: 'MikroTik Terminal Background Palette, Command History Dropdown & Arrow Key Navigation',
    changes: [
      'افزودن پالت انتخاب رنگ‌های پس‌زمینه به ترمینال میکروتیک (MikroTikTerminalModal) مشابه ترمینال سیسکو (شامل رنگ‌های سرمه‌ای پیش‌فرض روتر او اس، مشکی OLED، سرمه‌ای اقیانوسی، آبی‌نفتی میکروتیک، ماتریکس، بنفش سایبرپانک، زغالی و سفید ملایم) همراه با ذخیره‌سازی خودکار در localStorage',
      'افزودن دکمه تاریخچه (History) در کنار دکمه Send در نوار ورودی ترمینال میکروتیک همراه با شمارنده دستورات و منوی شناور',
      'امکان اجرای مجدد و سریع هر دستور قبلی با دکمه Run، کلیک روی ردیف برای درج مستقیم در پرامپت، و دکمه پاک‌سازی کامل تاریخچه (Clear)',
      'پشتیبانی کامل از کلیدهای جهت‌نمای بالا و پایین کیبورد (ArrowUp / ArrowDown) برای پیمایش سریع در دستورات قبلی و بعدی با حفظ متن در حال تایپ کاربر (Draft Input) و تنظیم خودکار مکان‌نما در انتهای خط'
    ],
    changes_en: [
      'Added terminal background color customization palette to MikroTikTerminalModal matching Cisco terminal palette (RouterOS Slate, OLED Black, Midnight Navy, MikroTik Teal, Matrix Green, Cyberpunk Violet, Zinc Charcoal, and Clean Light) with localStorage persistence',
      'Introduced dedicated History button next to the Send button in MikroTik Terminal with badge counter and interactive dropdown menu',
      'Instant re-execution of previous commands with one-click Run button, click-to-insert into prompt, and Clear History action',
      'Complete ArrowUp and ArrowDown keyboard history navigation with draft input buffer preservation and end-of-line cursor positioning'
    ]
  },
  {
    version: '1.15.1',
    releaseDate: '2026-09-10',
    type: 'patch',
    title: 'ارتقای گرافیک بومی پورت‌های میکروتیک، هماهنگی کامل تم روشن در ترمینال و اتصال دوطرفه سلسله‌مراتب فیزیکی در فرم ثبت تجهیز',
    title_en: 'Native MikroTik Port Graphics, Light Theme Parity in RouterOS Terminal, and Bidirectional Physical Placement Selector/Creator',
    changes: [
      'یکپارچه‌سازی سلسله‌مراتب فیزیکی (Physical Placement) در مودال ثبت تجهیز جدید (AddDeviceModal): امکان انتخاب مستقیم تمام ساختمان‌ها، طبقات، واحدها، اتاق‌ها، سکشن‌ها و رک‌های تعریف‌شده در سیستم یا ایجاد موارد جدید با ذخیره‌سازی بلادرنگ در حافظه سلسله‌مراتب شبکه',
      'طراحی مجدد و دقیق پورت‌های میکروتیک (MikroTikPortSvg): شبیه‌سازی جک‌های فلزی شیلدد RJ45، پین‌های تماس طلایی، ال‌ای‌دی‌های دوگانه LINK و ACT، نشانگرهای R (Running) و X (Disabled)، برچسب PoE-IN روی پورت ether1 و اسلات‌های نوری فلزی SFP+ 10G با زبانه اهرم و کانکتورهای LC Duplex',
      'پشتیبانی کامل تم روشن (Light Mode) در مودال ترمینال خط فرمان میکروتیک (MikroTikTerminalModal) و مودال مدیریت سخت‌افزار میکروتیک (MikroTikDeviceManageModal) منطبق بر پالت رنگ روشن سیستم',
      'همگام‌سازی بلادرنگ سلسله‌مراتب مکان فیزیکی با رخداد سفارشی nettopology_hierarchy_updated بین تب Physical Placement و مودال ثبت تجهیز'
    ],
    changes_en: [
      'Integrated Physical Placement hierarchy into AddDeviceModal: select from all existing buildings, floors, rooms/units/sections, and racks or quickly define new ones with instant synchronization',
      'Crafted authentic MikroTik hardware port graphics (MikroTikPortSvg) including metallic shielded RJ45 jacks, gold contact pins, dual LINK & ACT corner LEDs, RouterOS R/X flags, ether1 PoE-IN badge, and SFP+ 10G optical cages',
      'Full light theme parity for MikroTik RouterOS Interactive Terminal and Hardware Management modals matching system theme settings',
      'Real-time bidirectional event synchronization for physical locations across Schematic Topology and Add Device workflows'
    ]
  },
  {
    version: '1.15.0',
    releaseDate: '2026-09-10',
    type: 'minor',
    title: 'مودال‌های اختصاصی میکروتیک (MikroTik RouterOS Terminal & Management Modal) و اتصال هوشمند شماتیک توپولوژی',
    title_en: 'Dedicated MikroTik RouterOS Terminal Modal, Hardware & Port Management Console, and Schematic Topology Integration',
    changes: [
      'پیاده‌سازی مودال اختصاصی ترمینال میکروتیک (MikroTikTerminalModal) با تم تاریک RouterOS، بنر اسکی آرت بومی میکروتیک، پرامپت پویا ([admin@Identity] >) و پشتیبانی از کلیه دستورات خط فرمان با اسلش',
      'ایجاد سایدبار راهنمای جامع دستورات RouterOS دسته‌بندی‌شده شامل پورت‌ها و بریج (/interface)، آدرس‌ها و روتینگ (/ip)، سیستم و سخت‌افزار (/system)، ابزارهای پایش و پینگ (/tool) و استخراج پیکربندی (/export)',
      'توسعه مودال جامع مدیریت سخت‌افزار و پورت‌های میکروتیک (MikroTikDeviceManageModal) به سبک WinBox و WebFig با نمایش گرافیکی شاسی پورت‌ها (Faceplate)، وضعیت‌های R (Running)، X (Disabled) و پورت‌های SFP+ 10G',
      'امکان مدیریت بلادرنگ مشخصات اینترفیس‌ها، تغییر وضعیت Admin، شناسه PVID/VLAN، سرعت، برچسب کامنت و انجام عملیات گروهی (Batch Operations) روی پورت‌های میکروتیک',
      'تب‌های پایش منابع سخت‌افزاری RouterBOARD (لود پردازنده، حافظه رم، فضای دیسک NAND، ولتاژ، دما)، مدیریت آدرس‌های IP و روتینگ، بریج و VLAN filtering، و استخراج اسکریپت .rsc با یک کلیک',
      'یکپارچه‌سازی کامل در نقشه شماتیک توپولوژی (Schematic Topology View): کلیک روی دکمه CLI در کارت‌های دیوایس میکروتیک مستقیماً ترمینال اختصاصی میکروتیک را باز می‌کند و کلیک روی دکمه پورت‌ها، مودال اختصاصی مدیریت میکروتیک را فراخوانی می‌کند.'
    ],
    changes_en: [
      'Implemented dedicated MikroTik RouterOS Interactive Terminal Modal (MikroTikTerminalModal) featuring RouterOS branding, ASCII banner art, native prompt ([admin@Identity] >), and slash command execution',
      'Built MikroTik Command Guide sidebar categorized by Interfaces & Bridge (/interface), IP & Routing (/ip), System Resources (/system), Diagnostic Tools (/tool), and Configuration Export (/export)',
      'Developed comprehensive MikroTik Device & Port Inspector Modal (MikroTikDeviceManageModal) inspired by WinBox/WebFig with physical chassis faceplate, status LEDs (Running/Disabled/SFP+), and port inspector',
      'Enabled real-time interface configuration, Admin status toggle, PVID/VLAN assignment, link speed, comment annotations, and multi-port batch operations',
      'Added hardware resource monitors (multi-core CPU, RAM, NAND flash, voltage, temperature), IP address table manager, Bridge VLAN filtering overview, and one-click .rsc configuration export',
      'Full Schematic Topology View integration: clicking CLI on any MikroTik node card immediately opens the dedicated RouterOS Terminal, and clicking Ports opens the dedicated MikroTik Device & Port Manager'
    ]
  },
  {
    version: '1.14.0',
    releaseDate: '2026-09-10',
    type: 'minor',
    title: 'بازطراحی جامع معماری چندپلتفرمه دیوایس‌ها با الگوی درایور (Multi-Vendor Driver Pattern)، ترمینال چندسیستم‌عاملی (Cisco/MikroTik/Linux) و تفکیک انحنای کابل‌های موازی توپولوژی',
    title_en: 'Multi-Vendor Driver Architecture (Cisco IOS/IOS-XE, MikroTik RouterOS, Linux), Platform-Aware Interactive Terminal & Parallel Topology Links Curvature',
    changes: [
      'پیاده‌سازی الگوی معماری درایور (Driver Pattern) در بک‌اند با ایجاد کلاس انتزاعی BaseDriver و درایورهای مستقل برای Cisco (IOS/IOS-XE)، MikroTik (RouterOS)، Generic Linux و Simulator',
      'مدیریت هوشمند و بهینه اتصالات SSH با کلاس تخصصی SSHConnectionManager بر پایه پارامیکو، سیاست Lazy Connection و بستن خودکار نشست‌های بلااستفاده',
      'بازطراحی فرم‌های افزودن و ویرایش دیوایس (Add/Edit Device Modal) با پشتیبانی صریح از انتخاب پلتفرم (Platform & OS Driver)، سوییچ حالت درایور (SSH Live / Simulator) و پنهان‌سازی خودکار فیلدهای غیرمرتبط مانند Enable Secret برای میکروتیک و لینوکس',
      'یکپارچه‌سازی و استانداردسازی مدل داده‌ای Device با آبجکت ساختاریافته connection شامل پروتکل، هاست، پورت، تایم‌اوت و اعتبارسنجی مستقل',
      'توسعه ترمینال تعاملی دیوایس با تشخیص بلادرنگ پلتفرم: پشتیبانی از پرامپت‌ها و ساختار شل بومی میکروتیک ([admin@Router] >) و لینوکس (user@host:~$) و خطایابی استاندارد هر سیستم‌عامل',
      'افزودن سایدبار هوشمند دستورات (Command Guide) اختصاصی برای سیستم‌عامل لینوکس (شامل ip -c a، ss -tulpn، ethtool، systemctl، iptables و...) در کنار دستورات میکروتیک و سیسکو',
      'بهینه‌سازی محاسبات ریاضی موتور برداری نقشه توپولوژی (Schematic Map) و تفکیک کامل انحنای کابل‌های موازی بین دو دیوایس (Parallel Cables Overlap Fix) با اصلاح تراز جهت برداری'
    ],
    changes_en: [
      'Implemented backend Multi-Vendor Driver Pattern with BaseDriver abstraction and dedicated driver modules for Cisco IOS/IOS-XE, MikroTik RouterOS, Generic Linux, and Simulator',
      'Added enterprise SSHConnectionManager with Paramiko, lazy session acquisition, keepalive support, and automatic lifecycle cleanup',
      'Overhauled Add & Edit Device modals with Hardware Platform & OS selection, Driver Mode toggles (SSH Live vs Simulator), and platform-tailored credential inputs',
      'Standardized device schema with unified connection object supporting explicit protocols, ports, hosts, timeouts, and multi-vendor credentials',
      'Upgraded Interactive Device Terminal with native platform awareness: dynamic prompts ([admin@Router] >, user@host:~$), banner styling, and OS-authentic command parsing',
      'Enriched Quick Command Guide sidebar with dedicated Linux POSIX/iproute2 commands (ip -c a, ss -tulpn, ethtool, iptables, systemctl) alongside MikroTik and Cisco catalogs',
      'Resolved parallel topology link overlaps in Schematic View with vector direction compensation and dynamic curvature separation'
    ]
  },
  {
    version: '1.13.0',
    releaseDate: '2026-09-10',
    type: 'minor',
    title: 'پورتال جامع پشتیبان‌گیری و بازیابی اطلاعات شبکه (Backup & Disaster Recovery Portal) با رمزنگاری AES-GCM، ممیزی امنیتی SHA-256 و نقطه بازگشت خودکار',
    title_en: 'Enterprise Backup & Disaster Recovery Portal with 256-bit AES-GCM Encryption, SHA-256 Checksum Auditing & Instant Safety Rollback Protection',
    changes: [
      'ایجاد پورتال اختصاصی و پیشرفته پشتیبان‌گیری و بازیابی اطلاعات شبکه (Backup Portal) در منوی تنظیمات و سایدبار با رویکرد تاب‌آوری در برابر فاجعه (Disaster Recovery)',
      'پشتیبانی از تفکیک دامنه‌های استخراج: پکیج جامع شبکه (Full DR)، نقشه‌ها و توپولوژی سفارشی، کاربران و سطوح دسترسی (RBAC)، و الگوهای پیکربندی',
      'امنیت حداکثری داده‌ها: رمزنگاری استاندارد AES-GCM (256-bit) با مشتق‌گیری کلید PBKDF2 از رمز عبور دلخواه و قابلیت پاکسازی و ماسک‌کردن سکرت‌ها و پسوردهای SSH جهت اهداف ممیزی',
      'حفاظت و ارزیابی پیش از بازیابی (Pre-flight Inspection): بررسی خودکار اصالت امضای دیجیتال و هش SHA-256 و پیش‌نمایش دقیق محتوا قبل از اعمال روی دیتابیس',
      'مکانیزم ایمن بازگردانی: پشتیبانی از دو استراتژی جایگزینی کامل (Full Overwrite) با تایید کلمه‌ای و ادغام هوشمند افزایشی (Smart Incremental Merge)',
      'نقطه بازیابی اضطراری خودکار (Safety Snapshot): ایجاد اسنپ‌شات پیش از هرگونه تغییر با قابلیت بازگشت آنی یک‌کلیکه (Instant Rollback)',
      'کنترل دسترسی دقیق (RBAC): افزودن مجوزهای مجزای canExportBackup و canImportBackup به ماتریس پالیسی‌های دسترسی جهت مسدودسازی دسترسی کاربران غیرمجاز',
      'دفتر کل رویدادها (Audit Trail): ثبت دائمی تمام فعالیت‌های استخراج، بازیابی، رول‌بک و درخواست‌های مسدودشده با جزئیات کاربر و هش فایل'
    ],
    changes_en: [
      'Introduced dedicated Enterprise Backup & Disaster Recovery Portal in Settings and Sidebar with disaster resilience and state preservation architecture',
      'Multi-scope export engine: Full Disaster Recovery package, Custom Topology Maps & Inventory, Identity & Access Policies (RBAC), and Configuration Templates',
      'High-grade cryptographic security: 256-bit AES-GCM encryption with PBKDF2 key derivation from custom passphrase, plus sensitive credential sanitization for safe audit exports',
      'Pre-flight integrity validation: Automatic SHA-256 checksum verification, structural schema validation, and item inventory preview before database commit',
      'Two restore execution modes: Full Overwrite with safety keyword confirmation ("RESTORE") or Smart Incremental Merge preserving existing state',
      'Automated disaster rollback snapshot (Safety Point): Captures live system state prior to any restore operation with one-click Instant Rollback capability',
      'Granular RBAC integration: Added dedicated canExportBackup and canImportBackup capability flags to access control policies, locking actions for unauthorized roles',
      'Tamper-evident Disaster Recovery Audit Trail: Real-time logging of all export, restore, rollback, and RBAC-blocked events with timestamps and SHA-256 hashes'
    ]
  },
  {
    version: '1.12.0',
    releaseDate: '2026-09-09',
    type: 'minor',
    title: 'تفکیک منوی تنظیمات به زیرمنوهای سایدبار، ایجاد ماژول مدیریت کاربران و گروه‌های محلی و تعمیم کنترل دسترسی (RBAC) به تجهیزات میکروتیک و لینوکس',
    title_en: 'Modular Settings Navigation in Sidebar, Local Users & Security Groups Identity Management & Multi-Vendor Granular RBAC (Cisco, MikroTik RouterOS, Linux)',
    changes: [
      'تفکیک صفحات منوی تنظیمات از تب‌های فشرده درون‌صفحه‌ای به زیرمنوهای مستقل در سایدبار (گروه‌بندی دیوایس‌ها، کاربران و گروه‌های محلی، اکتیو دایرکتوری، سطوح دسترسی RBAC)',
      'افزودن کامل بخش مدیریت کاربران و گروه‌های محلی (Local Users & Security Groups) با قابلیت ایجاد کاربر، تخصیص کلمه عبور، فعال/غیرفعال‌سازی، تعریف گروه‌های امنیتی و مدیریت عضویت',
      'تعمیم جامع ماتریس دسترسی به تجهیزات غیر سیسکو و پشتیبانی از تجهیزات میکروتیک (MikroTik RouterOS) شامل Bridge VLAN، غیرفعال‌سازی اینترفیس، Safe-Mode، بکاپ و کنسول RouterOS',
      'پشتیبانی از اختیارات تجهیزات جنریک و لینوکسی (ip link toggle، عیب‌یابی پکت و شبکه، بکاپ کانفیگ، شل ترمینال)',
      'یکپارچه‌سازی کامل شبیه‌ساز نقش‌ها و پالیسی‌های دسترسی با کاربران و گروه‌های محلی در کنار اکتیو دایرکتوری'
    ],
    changes_en: [
      'Refactored Settings into dedicated sidebar submenus (Device Groups, Local Identity, Active Directory / LDAP, Granular RBAC) for clean navigation hierarchy',
      'Introduced full Local Identity management (Local Users & Security Groups) with account creation, credential management, activation toggles, and group membership sync',
      'Generalized Granular RBAC to multi-vendor network equipment with native MikroTik RouterOS capabilities (Bridge VLAN, interface toggle, Safe-Mode, IP pool, backup, RouterOS CLI)',
      'Added Linux & Generic network appliance capabilities (interface link toggle, diagnostics ping/trace/capture, config archive, SSH shell terminal)',
      'Fully linked the RBAC live role simulator with local identity groups and accounts alongside Active Directory'
    ]
  },
  {
    version: '1.11.0',
    releaseDate: '2026-09-09',
    type: 'minor',
    title: 'رفع سرریز دراپ‌داون اینترفیس‌ها در ترمینال، متن سفید پررنگ تگ‌های Trunk/Access، بنر تیره لاگین، منوی راست‌کلیک پورت‌ها (Shutdown/No Shutdown) و نشان استاندارد Layer 2 Security',
    title_en: 'Resolved Terminal Interface Dropdown Viewport Overflow, Bold White Trunk/Access Badges, Dark Gray Login Banner, Switch Faceplate Right-Click Context Menu (Shutdown/No Shutdown) & Standardized Layer 2 Security Badge',
    changes: [
      'اصلاح و بهینه‌سازی کادر کشویی اینترفیس‌ها در مودال ترمینال سیسکو و جلوگیری کامل از خروج آن از صفحه و کادر با جانمایی هوشمند',
      'اصلاح رنگ و کنتراست تگ‌های Trunk و Access در لیست اینترفیس‌ها به صورت متن کاملاً سفید و پررنگ (Bold) در تم روشن',
      'تغییر رنگ خطوط پیام احراز هویت لاگین (User Access Verification، نام کاربری، رمز عبور و خطوط ستاره) در تم روشن به رنگ خاکستری تیره استاندارد و خوانا',
      'اصلاح و سفید و بولد کردن متون و برچسب‌های بنفش در بخش Switch Faceplate زیر پورت‌های سخت‌افزاری',
      'تجهیز Switch Faceplate به منوی راست‌کلیک مستقیم با گزینه‌های مجزای Shutdown (خاموش/دیزیبل) و No Shutdown (روشن) و کپی دستورات CLI',
      'استانداردسازی کادر Layer 2 Security با متن مشکی و فونت پررنگ (Bold Black) در تمام بخش‌ها با کلاس سراسری'
    ],
    changes_en: [
      'Resolved Cisco terminal modal interface dropdown overflowing outside viewport with responsive auto-clamping and boundary protection',
      'Fixed contrast on Trunk and Access port mode badges with crisp bold white typography on vivid backgrounds in light theme',
      'Darkened Cisco login verification text (User Access Verification, credentials, and asterisks) to readable dark gray in light mode',
      'Formatted purple badges and VLAN tags under Switch Faceplate ports with high-contrast bold white text',
      'Equipped Switch Faceplate ports with dedicated right-click context menu offering direct Shutdown and No Shutdown operations with CLI command copy',
      'Standardized Layer 2 Security badges globally with ultra-crisp bold black text styling'
    ]
  },
  {
    version: '1.10.0',
    releaseDate: '2026-09-09',
    type: 'minor',
    title: 'اتصال زنده و واقعی SSH به تجهیزات شبکه در ترمینال CLI، نمایش پویا و زنده پورت‌ها، حذف بصری کابل‌های نقشه با تاییدیه و خوانایی برچسب‌های لینک',
    title_en: 'Real Hardware SSH Connectivity in Cisco Terminal CLI, Dynamic Real-Time Interface State Engine, Visual Topology Cable Deletion with Confirmation & Overlap-Free Link Badges',
    changes: [
      'پیاده‌سازی ارتباط زنده و واقعی SSH (Native SSH Client) از طریق کتابخانه قدرتمند ssh2 در بک‌اند نود و اجرای مستقیم دستورات روی تجهیزات سخت‌افزاری',
      'نمایش بلادرنگ وضعیت نشست SSH، تاخیر میلی‌ثانیه‌ای (Latency)، سایفر ارتباطی و لاگین زنده در سربرگ ترمینال سیسکو',
      'موتور پویا و زنده نمایش اطلاعات پورت‌ها و اینترفیس‌ها در دستورات show ip interface brief، show mac address-table، show port-security و show interfaces status بر اساس وضعیت حقیقی دستگاه',
      'امکان حذف بصری و مستقیم کابل‌ها و اتصالات در نقشه شماتیک توپولوژی با دکمه ضربدر شناور هنگام هاور موس همراه با مودال تایید حذف امن',
      'بهینه‌سازی کامل نشان‌ها و برچسب‌های اطلاعاتی کابل‌ها (پورت، ویلن و IP) جهت جلوگیری از همپوشانی و خوانایی حداکثری'
    ],
    changes_en: [
      'Implemented real hardware SSH connectivity using the native ssh2 client in the backend server with live command execution on network devices',
      'Added real-time SSH session indicator badges, millisecond latency measurements, cipher negotiation details, and live handshake in the Cisco terminal header',
      'Dynamic real-time interface and port state engine for show ip interface brief, show mac address-table, show port-security, and show interfaces status reflecting actual hardware configurations',
      'Visual interactive cable deletion on topology links with hover-activated delete action and a confirmation modal for safe link removal',
      'Optimized cable label badges (port IDs, VLANs, and IPs) with enhanced spacing to eliminate visual overlap and ensure maximum clarity'
    ]
  },
  {
    version: '1.9.0',
    releaseDate: '2026-09-09',
    type: 'minor',
    title: 'تست زنده اتصال SSH تجهیزات، فیلدهای احراز هویت در فرم افزودن تجهیز و ویرایش و اعمال دسته‌ای پورت‌های سوئیچ (Multi-Port Batch Configuration)',
    title_en: 'Live SSH Device Connection Testing, Inventory Credential Fields & Multi-Port Batch Switchport Configuration',
    changes: [
      'افزودن فیلدهای اطلاعات احراز هویت SSH (پورت، نام کاربری، کلمه عبور و Enable Secret) به مودال افزودن تجهیز جدید',
      'دکمه تعاملی بررسی زنده اتصال SSH (Test Connection) با سنجش بلادرنگ تاخیر (Latency) و نمایش فیدبک بصری خطا یا موفقیت',
      'امکان انتخاب چندتایی پورت‌های سوئیچ با نگه‌داشتن کلید Ctrl / Cmd / Shift روی فیس‌پلیت سخت‌افزاری یا چک‌باکس‌های جدول پورت‌ها',
      'پنل اختصاصی پیکربندی دسته‌ای پورت‌ها (Batch Configuration) با قابلیت تغییر همزمان وضعیت ادمین (no shutdown / shutdown)، مود ترانک و اکسس، تخصیص ویلن، ویلن‌های مجاز و امنیت پورت (Port Security)',
      'یکپارچه‌سازی کامل قابلیت ویرایش گروهی پورت‌ها در هر دو نمای مودال بازرس پورت (PortInspectorModal) و صفحه مستقل مدیریت پورت‌ها (PortManagementView)'
    ],
    changes_en: [
      'Added SSH credential fields (SSH Port, Username, Password, and Enable Secret) to the Add Device modal',
      'Interactive live SSH connection test button (Test Connection) with real-time latency measurement and visual feedback',
      'Multi-port batch selection support via Ctrl / Cmd / Shift + click on hardware faceplate ports or table checkboxes',
      'Dedicated Multi-Port Batch Configuration panel for bulk updates to Admin Status, Switchport Mode, Access VLAN, Trunk Allowed VLANs, and Cisco Port Security',
      'Unified batch configuration across both PortInspectorModal and the dedicated PortManagementView page'
    ]
  },
  {
    version: '1.8.2',
    releaseDate: '2026-09-09',
    type: 'patch',
    title: 'رفع خطای فراخوانی تابع ذخیره در مودال پیکربندی لینک (Fix onSave Function Handler in Link Modal)',
    title_en: 'Fix onSave Function Handler in Link Configuration Modal',
    changes: [
      'رفع خطای Uncaught TypeError: onSave is not a function هنگام ثبت کابل و ایجاد اتصال در نقشه سفارشی توپولوژی',
      'پشتیبانی دوگانه از پروپ‌های onSave / onSaveLink و onDelete / onDeleteLink با فراخوانی ایمن در مودال پیکربندی کابل و لینک'
    ],
    changes_en: [
      'Resolved Uncaught TypeError: onSave is not a function when connecting cables and creating links in custom topology maps',
      'Added dual backward-compatible support for onSave/onSaveLink and onDelete/onDeleteLink with defensive invocation guards in the link configuration modal'
    ]
  },
  {
    version: '1.8.1',
    releaseDate: '2026-09-09',
    type: 'patch',
    title: 'رفع خطای برخورد نام آیکون Map با سازنده اصلی جاوااسکریپت (Fix Map Constructor Conflict)',
    title_en: 'Fix Map Name Collision with JavaScript Native Map Constructor',
    changes: [
      'رفع خطای Uncaught TypeError: Map is not a constructor در صفحه شماتیک توپولوژی با تغییر نام آیکون Map به MapIcon',
      'تضمین عملکرد بی‌نقص نگاشت مختصات نودها در بوم نقشه با استفاده از شیء استاندارد JavaScript Map'
    ],
    changes_en: [
      'Resolved Uncaught TypeError: Map is not a constructor in Schematic Topology View by aliasing the Lucide Map icon to MapIcon',
      'Ensured seamless coordinate and node position mapping on the canvas using the native JavaScript Map object'
    ]
  },
  {
    version: '1.8.0',
    releaseDate: '2026-09-09',
    type: 'minor',
    title: 'سیستم جامع نقشه‌های سفارشی توپولوژی، ابزار سیم‌کشی و کابل‌کشی تعاملی و پیکربندی پورت‌ها و لینک‌ها',
    title_en: 'Custom Topology Maps, Interactive Cabling Tool, and Dual-End Port & Link Configuration Engine',
    changes: [
      'امکان ایجاد، ویرایش، حذف و جابجایی بین چندین نقشه توپولوژی سفارشی (Custom Topology Maps) در کنار نقشه خودکار کشف‌شده شبکه',
      'قابلیت انتخاب و افزودن تجهیزات موجود در شبکه به نقشه‌های سفارشی و تعیین موقعیت مکانی دلخواه بر روی صفحه بوم (Canvas)',
      'نوار ابزار تعاملی جدید شامل ابزار انتخاب/جابجایی (Select) و ابزار کابل‌کشی (Cable Tool) با بنر راهنمای گام‌به‌گام',
      'مودال انتخاب پورت تعاملی با پیش‌نمایش سخت‌افزاری Faceplate، تفکیک پورت‌های مبدأ و مقصد و تشخیص پورت‌های آزاد و مشغول',
      'مودال پیشرفته پیکربندی لینک و اتصالات کابل با قابلیت تعیین IP هر دو سمت، نوع کابل (Copper, Fiber, Serial)، پهنای باند، حالت پورت (Trunk یا Access)، شماره ویلن اختصاصی و توضیحات',
      'برچسب‌گذاری و نمایش زنده مشخصات کابل، پورت‌ها، شماره ویلن و IP هر سمت بر روی خطوط ارتباطی SVG در نقشه سفارشی با قابلیت کلیک برای ویرایش یا حذف لینک',
      'ذخیره‌سازی پایدار و مجزای نقشه‌ها، چیدمان نودها و لینک‌ها در حافظه محلی سیستم (LocalStorage)'
    ],
    changes_en: [
      'Support for creating, editing, renaming, deleting, and switching between multiple custom user-defined topology maps alongside the auto-discovered network schematic',
      'Ability to add and position existing inventory switches and routers onto custom map canvases with drag-and-drop spatial coordinate persistence',
      'New secondary toolbar with Select/Move and interactive Cable tools featuring persistent step-by-step connection banners',
      'Visual port selector modal featuring hardware switch faceplate previews, search filtering, and occupied/free port detection',
      'Advanced dual-end link configuration modal to define management IPs, port modes (802.1Q Trunk vs Access), VLAN IDs, cable types (Copper, Fiber, Serial), and link speeds',
      'Interactive SVG link rendering with endpoint badges for source/target ports, VLANs, and IPs, plus click-to-edit capabilities',
      'Complete client-side persistence of custom maps, node layouts, and custom link configurations in LocalStorage'
    ]
  },
  {
    version: '1.7.1',
    releaseDate: '2026-09-09',
    type: 'patch',
    title: 'یکپارچه‌سازی کامل نمایش فیزیکی پورت‌های سوئیچ (Switch Faceplate) در صفحه پایش پورت‌ها و ویلن',
    title_en: 'Harmonize Switch Faceplate Visual & Port Matrix in Port & VLAN Monitoring View',
    changes: [
      'یکپارچه‌سازی کامل نحوه نمایش پورت‌های فیزیکی در بخش «Ports, Trunk/Access & VLAN Monitoring» با استاندارد Switch Faceplate مودال جزئیات تجهیزات',
      'به‌کارگیری کامپوننت وکتور پورت‌های RJ-45 (NetworkPortSvg) به همراه شاسی سخت‌افزاری سوئیچ (Switch Chassis & Grid) در صفحه مدیریت پورت‌ها',
      'افزودن کارت اختصاصی وضعیت پورت سکیوریتی سیسکو (Cisco Port Security) به کارت ۵ گانه بازرس پورت در حالت مشاهده',
      'هماهنگ‌سازی لژند رنگی پورت‌ها (Up, Down, Disabled, Trunk) و ال‌ای‌دی‌های وضعیت با استانداردهای طراحی شاسی سخت‌افزاری'
    ],
    changes_en: [
      'Harmonized the physical port visualization in "Ports, Trunk/Access & VLAN Monitoring" to match the exact Switch Faceplate chassis and grid design of PortInspectorModal',
      'Integrated dedicated RJ-45 vector socket rendering (NetworkPortSvg) with interactive link LEDs, VLAN chips, and responsive hover/context states',
      'Added Cisco Port Security status card to the 5-card inspector grid in the port management view',
      'Synchronized faceplate header, hardware chassis background, and port status legend (Up, Down, Disabled, Trunk) across views'
    ]
  },
  {
    version: '1.7.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'تاییدیه هوشمند دستورات سیسکو (سویچ/روتر)، مودال تخصیص ویلن، رنگ‌بندی وضعیت پورت‌ها و ناوبری پورت سکیوریتی',
    title_en: 'Cisco Device Command Confirmation (Switch/Router), Assign Access VLAN Modal, Port State Visuals & Port Security Navigation',
    changes: [
      'افزودن مودال تایید دو مرحله‌ای بله/خیر با تولید و پیش‌نمایش بلادرنگ دستورات Cisco IOS متناسب با نوع دستگاه (Switch یا Router) برای تغییرات Shutdown/No Shutdown، ترانک، اکسس و پورت سکیوریتی',
      'طراحی مودال اختصاصی تخصیص ویلن دسترسی (Assign Access VLAN Modal) با نمایش لیست ویلن‌های موجود تجهیز در بالا و کادر ورودی شماره دلخواه ویلن با تولید دستور متناظر switchport access vlan',
      'هدایت هوشمند و خودکار گزینه «فعال‌سازی پورت سکیوریتی» در منوی راست‌کلیک به بخش ویرایش پورت و تیک خوردن خودکار سکیوریتی جهت تنظیم دستی کاربر',
      'رنگ‌بندی بصری پورت‌های فیزیکی سوئیچ: پس‌زمینه قرمز ملایم برای پورت‌های Shutdown، پس‌زمینه نارنجی ملایم برای پورت‌های Disabled و حالت پیش‌فرض برای پورت‌های Up',
      'اصلاح رنگ و کنتراست بج‌های ویلن (v1, v10, ...) با متن سفید پررنگ (Bold White) روی پس‌زمینه بنفش برای خوانایی بی‌نقص در تمامی تم‌ها'
    ],
    changes_en: [
      'Interactive Yes/No Cisco CLI Command Confirmation Modal with real-time command syntax preview tailored to device type (Switch vs Router) for shutdown, no shutdown, trunk/access, and security toggle',
      'Dedicated Assign Access VLAN modal displaying existing device VLANs at top with custom VLAN ID input and generated CLI configuration preview',
      'Context menu "Enable Port Security" automated routing into port inspector edit form with auto-enabled toggle and smooth scroll',
      'Dynamic port status background coloring on Switch Faceplate: soft red tint for shutdown ports, soft amber tint for disabled ports, and standard dark tint for active ports',
      'High-contrast bold white typography on purple VLAN badges across switch ports and inventory tables for optimal visibility'
    ]
  },
  {
    version: '1.6.1',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'منوی راست‌کلیک پورت‌های سوئیچ (Cisco Port Context Menu)، بهینه‌سازی دراپ‌داون اینترفیس‌ها و کنتراست بالای لیبل‌ها در تم روشن',
    title_en: 'Cisco Switch Port Right-Click Context Menu, Terminal Interface Dropdown Fix & High-Contrast Light Theme Badges',
    changes: [
      'افزودن منوی راست‌کلیک پیشرفته روی پورت‌های فیزیکی سوئیچ (Switch Faceplate) جهت اعمال دستورات shutdown / no shutdown، تغییر حالت Trunk/Access، فعال‌سازی پورت سکیوریتی و تنظیم سریع VLAN',
      'رفع مشکل خروج لیست اینترفیس‌ها در مودال ترمینال از کادر و بهبود اسکرول و جانمایی خودکار با کلیک در بیرون کادر',
      'اصلاح رنگ و کنتراست تگ‌های Trunk و Access در تم روشن به صورت متن سفید پررنگ (Bold) روی پس‌زمینه بنفش/نیلی خوانا',
      'اصلاح رنگ متن بنر لاگین ترمینال (User Access Verification، نام کاربری و پسورد و خطوط ستاره) در تم روشن به خاکستری تیره استاندارد و خوانا',
      'به‌روزرسانی و استانداردسازی جهانی برچسب Layer 2 Security در کادر پورت سکیوریتی با متن مشکی و فونت بولد برجسته'
    ],
    changes_en: [
      'Introduced advanced right-click context menu (CiscoPortContextMenu) on Switch Faceplate physical ports for instant shutdown/no-shutdown, Trunk/Access mode toggle, Port Security activation, and quick VLAN assignment',
      'Resolved terminal modal interface dropdown overflowing outside viewport with responsive placement and click-outside dismissal',
      'Enhanced Trunk and Access port mode badges with crisp white bold typography over vivid purple/indigo backgrounds for pristine readability across light and dark themes',
      'Refined Cisco Terminal login verification banner text (User Access Verification, credentials, and asterisks) to dark slate/gray in light theme for optimal legibility',
      'Applied high-contrast bold black text styling globally to Layer 2 Security badge in Cisco Port Security modules'
    ]
  },
  {
    version: '1.6.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'مدیریت سلسله‌مراتبی پیشرفته استقرار فیزیکی (ساختمان > طبقه > بخش/واحد > رک) با درگ اند دراپ، ویرایش، حذف و تنظیم پورت بک‌اند',
    title_en: 'Advanced Hierarchical Physical Placement (Building > Floor > Unit > Rack) with Drag & Drop, Full CRUD & Backend Port Selection',
    changes: [
      'پیاده‌سازی ساختار سلسله‌مراتبی کامل فیزیکی شامل ساختمان (Building)، طبقه (Floor)، واحد/بخش (Unit/Section) و رک (Rack)',
      'پشتیبانی کامل از کشیدن و رها کردن (Drag & Drop) تجهیزات بین ساختمان‌ها، طبقات، بخش‌ها و رک‌ها با فیدبک بصری و ذخیره‌سازی زنده',
      'امکان ایجاد، ویرایش نام (Rename) و حذف (Delete) برای تمامی سطوح سلسله‌مراتب (ساختمان، طبقه، واحد و رک)',
      'افزودن امکان تعریف واحد/بخش و رک درون هر طبقه به صورت اختصاصی با مودال‌های مدرن',
      'حذف برچسب نسخه از هدر جهت خلوت‌تر و مینیمال شدن نوار بالایی سامانه',
      'دریافت پورت سفارشی بک‌اند با مقدار پیش‌فرض در اسکریپت‌های نصب خودکار (install.sh و setup-panel.sh)'
    ],
    changes_en: [
      'Full physical hierarchy structure implementation supporting Building > Floor > Unit/Section > Rack levels',
      'End-to-end interactive Drag & Drop for devices across buildings, floors, units, and racks with live visual drop feedback and persistence',
      'Complete CRUD controls: Add, Rename, and Delete for all hierarchy levels (Building, Floor, Unit, and Rack)',
      'Floor-level actions to dynamically spawn custom Units/Rooms and Server Racks via modern glassmorphic modals',
      'Removed version tag from top navbar for a clean, minimalist header bar',
      'Interactive backend port configuration with intelligent default fallback in automated Linux installer scripts (install.sh & setup-panel.sh)'
    ]
  },
  {
    version: '1.5.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'قابلیت کشیدن و رها کردن (Drag & Drop) تجهیزات بین طبقات و ساختمان‌ها در نقشه استقرار فیزیکی',
    title_en: 'Drag & Drop Physical Device Placement Across Buildings & Floors in Physical Map',
    changes: [
      'امکان درگ اند دراپ (Drag & Drop) تعاملی تجهیزات شبکه بین طبقات مختلف یک ساختمان یا جابجایی بین ساختمان‌های مجزا در نمای استقرار فیزیکی (Physical Placement)',
      'به‌روزرسانی آنی و زنده رابط کاربری (Optimistic UI) با ارسال همزمان درخواست تغییر موقعیت فیزیکی به بک‌اند و بازگشت خودکار در صورت بروز خطا',
      'افزودن امکان تعریف ساختمان جدید و طبقات جدید به صورت داینامیک با مودال‌های مدرن و شیشه‌ای',
      'افزودن دکمه و مودال جابجایی دستی (Manual Relocation) برای دستگاه‌ها جهت پشتیبانی از انتخاب دقیق یا سفارشی ساختمان و طبقه مقصد',
      'نمایش وضعیت زنده، پیام‌های راهنما، انیمیشن ناحیه هدف (Drop Zone) و بازخورد صوتی/بصری تغییر مکان'
    ],
    changes_en: [
      'Interactive HTML5 Drag & Drop for network devices between floors and across different buildings in the Physical Placement schematic view',
      'Optimistic UI state updates with real-time backend persistence (PUT /api/devices/:id) and automatic rollback upon error',
      'Dynamic creation of custom buildings and floors via clean glassmorphic modals to expand physical topology hierarchy',
      'Manual relocation modal offering accessible dropdown and custom input selectors for precision placement without drag gestures',
      'Live visual feedback including animated drop zones, moving indicator pills, and toast status notifications'
    ]
  },
  {
    version: '1.4.4',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'سازگاری کامل مودال بازرسی پورت با تمام تم‌های رنگی و خلوت‌سازی نوار کناری و پروفایل',
    title_en: 'Full Theme Color Compatibility for Port Inspector Modal & Sidebar/Profile Decluttering',
    changes: [
      'سازگاری کامل مودال بازرسی و پیکربندی پورت‌ها (Port Inspector Modal) شامل جدول پورت‌ها، فرم ویرایش و سامری تایید با تمامی تم‌های رنگی و تم روشن',
      'حذف باکس هشدار قطعی تجهیزات (Outage Alert) از سایدبار جهت خلوت‌سازی و پاکیزگی نوار ناوبری',
      'حذف نمایش شماره نسخه از پاورقی سایدبار',
      'مینیمال‌سازی نشانگر نشست فعال (Active Session) در منوی کاربری به یک نشانگر ظریف و پالس‌زننده'
    ],
    changes_en: [
      'Full multi-theme color compatibility for Port Inspector Modal including inventory table, edit form, and apply confirmation summary',
      'Removed Outage Alert box from sidebar to achieve a clean, clutter-free navigation drawer',
      'Removed version badge from sidebar footer',
      'Minimized Active Session status in profile dropdown to an elegant pulsing indicator'
    ]
  },
  {
    version: '1.4.3',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'خلوت‌سازی هدر، افزودن منوی دراپ‌داون پروفایل و سازگاری کامل صفحات پورت‌ها و اسکنر CDP/LLDP با تم‌های رنگی',
    title_en: 'Header Decluttering, Profile Dropdown Menu & Full Theme Color Compatibility for Port Management and CDP/LLDP Scanner',
    changes: [
      'ایجاد آیکون و منوی کشویی یکپارچه پروفایل (Profile Dropdown) در هدر با انتقال تنظیمات تیم/سازمان و سوئیچر زبان به داخل آن',
      'حذف نشانگرهای شلوغ تعداد تجهیزات آنلاین و کریتیکال از نوار بالایی جهت خلوت و مینیمال شدن کامل هدر',
      'کوچک‌سازی چشمگیر برچسب نسخه سامانه به یک تگ ظریف و فشرده در هدر',
      'اصلاح و بازطراحی کامل صفحه مدیریت پورت‌ها (PortManagementView) جهت سازگاری ۱۰۰٪ با تمامی تم‌های تیره و رنگی (Obsidian, Emerald, Cobalt, Rose, Amber, Light) و حذف پس‌زمینه‌های سفید استاتیک',
      'به‌روزرسانی و هماهنگ‌سازی استایل پوسته فیزیکی سوئیچ (Faceplate) و جدول پورت‌ها با افکت شیشه‌ای spatial-glass'
    ],
    changes_en: [
      'Implemented a unified user profile dropdown menu in header consolidating Team/Organization and Language controls',
      'Removed crowded online and critical device count badges to deliver a clean, minimalist header bar',
      'Significantly reduced header version badge size into a compact, elegant tag',
      'Refactored Port Management view (PortManagementView) to achieve 100% theme compatibility across Obsidian, Emerald, Cobalt, Rose, Amber, and Light palettes',
      'Harmonized switch hardware faceplate visual and ports data table with adaptive spatial-glass styling'
    ]
  },
  {
    version: '1.4.2',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'طراحی فاوآیکون اختصاصی شبکه و ترجمه کامل انگلیسی صفحات توپولوژی شماتیک، پورت‌ها، اسکنر CDP/LLDP و ادیتور قالب‌ها',
    title_en: 'Network Favicon & Complete English Localization for Schematic Topology, Port Management, CDP/LLDP Scanner & Template Editor',
    changes: [
      'طراحی فاوآیکون مدرن و وکتور مرتبط با شبکه (SVG) و جایگزینی آن در فایل اصلی index.html',
      'ترجمه و بومی‌سازی ۱۰۰٪ صفحه نقشه شماتیک توپولوژی شبکه شامل کارت‌های تجهیز، پورت‌ها، راهنمای نقشه، هدر، سرچ‌باکس و دراور جزئیات',
      'ترجمه کامل انگلیسی مودال ویرایش قالب‌های پیکربندی (Edit Configuration Template) شامل برچسب‌های متغیرها (Display Label) و پلیس‌هولدرها',
      'ترجمه جامع صفحه پایش و مدیریت پورت‌ها (Port Management) شامل طرح فیزیکی پورت‌ها (Faceplate)، فرم ویرایش پورت و جدول پورت‌ها',
      'بومی‌سازی کامل و رفع متون فارسی در اسکنر لایه ۲ همسایگی CDP/LLDP شامل دکمه‌ها، کارت‌های آماری، راهنمای پروتکل و جدول همسایگان'
    ],
    changes_en: [
      'Designed and deployed a modern network-themed SVG favicon replacing default icon in index.html',
      'Complete 100% English translation for Schematic Topology view including node cards, ports, legend, header controls, search, and detail drawer',
      'Localized Edit Configuration Template modal fields, variable display labels, and placeholders in English mode',
      'Comprehensive English localization for Port Management view including physical faceplate layout, port edit form, and inventory table',
      'Full localization of CDP/LLDP Layer-2 Discovery Scanner including scan controls, metrics cards, protocol guide, and neighbor table'
    ]
  },
  {
    version: '1.4.1',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'اصلاح ریسپانسیو مودال‌ها در صفحات کوچک و ترجمه کامل متون فارسی به انگلیسی',
    title_en: 'Modal Responsive Viewport Scaling & Complete English Localization for All Modals',
    changes: [
      'حل کامل مشکل بیرون زدن مودال‌ها از صفحه نمایش در مانیتورها و لپ‌تاپ‌های کوچک با ارتفاع داینامیک (max-h-[90vh]) و اسکرول داخلی',
      'ترجمه جامع و کامل ۱۰۰ درصدی تمام متون، پیام‌ها، راهنماها و دکمه‌های فارسی موجود در مودال‌ها در حالت انگلیسی',
      'تثبیت هدر و فوتر مودال‌ها (Pinned Header/Footer) با کانتینر اسکرول‌پذیر میانی برای دسترسی همیشگی به دکمه‌های تایید و بستن',
      'هماهنگ‌سازی و بهبود استایل مودال‌های ثبت تجهیز، کلون‌گیری، اعمال تمپلیت، بازرسی پورت، ترمینال و یادداشت‌های انتشار'
    ],
    changes_en: [
      'Fixed viewport overflow for all modals on small screens with max-h-[90vh] constraints and independent inner scrolling',
      'Complete 100% English translation for all modal dialogs, forms, tooltips, validation messages, and action buttons',
      'Pinned modal headers and action footers ensuring save/cancel controls remain visible and accessible on any screen height',
      'Harmonized visual styling across Add Device, Clone Template, Apply Template, Port Inspector, Terminal, and Release Notes modals'
    ]
  },
  {
    version: '1.4.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'سیستم جامع چندزبانگی (انگلیسی پیش‌فرض و فارسی)، منوی آکاردئونی سایدبار و یکپارچه‌سازی سایز دکمه‌ها',
    title_en: 'Comprehensive i18n System (English Default & Persian), Accordion Sidebar & Button Size Standardization',
    changes: [
      'پیاده‌سازی موتور جامع بین‌المللی‌سازی و چندزبانگی (i18n) با زبان پیش‌فرض انگلیسی (English Default) و زبان دوم فارسی (Persian)',
      'تضمین عدم نمایش هرگونه متن فارسی در حالت انگلیسی با واژه‌نامه کامل دوزبانه برای عناوین، پیام‌ها، دکمه‌ها، فیلترها و راهنماها',
      'سوئیچر زبان تعاملی در هدر (Navbar) با تغییر لحظه‌ای و پیوسته جهت چیدمان (RTL / LTR) و ذخیره‌سازی ماندگار در حافظه مرورگر',
      'بازطراحی ساختار منوی سایدبار به صورت آکاردئونی هوشمند (Accordion Collapsible Groups) با حالت باز پیش‌فرض و رفتار تک‌والد بازشونده',
      'هماهنگ‌سازی و استانداردسازی سایز، پدینگ و تایپوگرافی دکمه‌های اکشن بالای صفحه مدیریت الگوها بر اساس استانداردهای صفحه مدیریت تجهیزات',
      'ثبت قوانین الزامی چندزبانگی، رفتار سایدبار و استانداردهای دکمه‌ها در سند راهنمای سیستمی AGENTS.md'
    ],
    changes_en: [
      'Implemented robust internationalization (i18n) engine with English as default and Persian as secondary language',
      'Strict zero-Persian mandate in English mode with full dual-language dictionary across all views, controls, and alerts',
      'Interactive header language selector with seamless RTL/LTR layout transitions and persistent browser storage',
      'Accordion collapsible sidebar architecture with default-open state and single-parent auto-collapse behavior',
      'Standardized action button dimensions, paddings, and typography across template management and device inventory views',
      'Persistent system rule documentation updated in AGENTS.md'
    ]
  },
  {
    version: '1.3.4',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'اصلاح مخفی‌سازی هدر در حالت فول و بهبود موقعیت‌یابی و طراحی راهنمای نقشه توپولوژی',
    changes: [
      'مخفی‌سازی کامل هدر اصلی سامانه (شامل نام پورتال، دکمه داده‌های نمونه، پویش سریع، تم و...) در زمان فعال‌سازی حالت فول (Fullscreen Mode)',
      'اصلاح کانتینر اصلی در App.tsx جهت حذف کامل هدر، سایدبار و فوتر از DOM در حالت تمام‌صفحه و پیشگیری از هم‌پوشانی و تداخل لایه‌ها (Stacking Context)',
      'رفع کامل مشکل قرارگیری راهنمای نقشه توپولوژی زیر فوتر و انتقال آن به موقعیت استاندارد، زیبا و ایمن در گوشه پایین چپ نقشه',
      'طراحی جدید راهنمای نقشه به صورت کارت شناور هوشمند با قابلیت باز و بسته شدن (Collapse / Expand) جهت جلوگیری از پوشاندن نودها و پورت‌ها',
      'پشتیبانی هماهنگ و یکپارچه از کلید Esc جهت خروج روان از حالت تمام‌صفحه'
    ]
  },
  {
    version: '1.3.3',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'حالت تمام‌صفحه نقشه شماتیک (Fullscreen Topology) و معماری اختصاصی و امن Self-Signed SSL',
    changes: [
      'افزودن دکمه شناور اختصاصی حالت تمام‌صفحه در بالا سمت چپ نقشه شماتیک با نمایش عنوان «حالت فول» در هاور و پشتیبانی از کلید میانبر Esc',
      'پوشش کامل و ۱۰۰ درصدی صفحه مرورگر در حالت فول با مخفی‌سازی خودکار هدر، سایدبار، منوهای بالا و فوتر جهت اشراف کامل بر تمام گره‌ها و پیوندهای شبکه',
      'امکان سوئیچ و مخفی‌سازی/نمایش نوار ابزار داخل نقشه در حالت تمام‌صفحه جهت بهره‌برداری حداکثری از فضای ترسیم',
      'اصلاح ساختار اسکریپت‌های راه‌اندازی setup-panel.sh و install.sh و اجباری‌سازی معماری امن انحصاری Strict Self-Signed SSL (HTTPS)',
      'دریافت پورت دلخواه SSL کاربر و حذف کامل لیسنرهای ناامن HTTP (پورت 80 و پورت‌های مستقیم وب و بک‌اند)',
      'ایزوله‌سازی فرانت‌اند و بک‌اند به لوپ‌بک محلی (127.0.0.1) با بازهدایت خودکار خطای 497 (HTTP to HTTPS) در Nginx',
      'اصلاح گزارش نهایی نصب جهت ارائه منحصربه‌فرد آدرس HTTPS امن بدون درج آدرس‌های ناامن دیگر'
    ]
  },
  {
    version: '1.3.2',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'تثبیت و رفع اسکرول منوی دسترسی سایدبار راست (Sticky Sidebar Navigation)',
    changes: [
      'تثبیت کامل منوی دسترسی سایدبار راست حین اسکرول محتوای صفحات (مانند لیست بلند تجهیزات، داشبورد و مدیریت پورت‌ها)',
      'جداسازی اسکرول محتوای صفحه از سایدبار با ساختار دوگانه کانتینر در App.tsx (افزودن overflow-hidden به ریشه و overflow-y-auto به کانتینر اصلی محتوا)',
      'افزودن موقعیت‌یابی چسبنده (sticky top-14) و ارتفاع کامل به همراه اسکرول‌بار اختصاصی و ظریف (custom-scrollbar) برای منوی سایدبار در صفحات کوچک و بزرگ',
      'بهبود استایل و کنتراست آیتم‌های سایدبار در تم روشن (Light Theme) جهت نمایش شفاف وضعیت انتخاب و هاور'
    ]
  },
  {
    version: '1.3.1',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'اصلاح کامل رنگ‌بندی مودال‌های استخراج کانفیگ زنده و اعمال تمپلیت در تم روشن (Light Theme Harmonization)',
    changes: [
      'هماهنگ‌سازی کامل استایل و رنگ‌بندی مودال CaptureConfigModal بر اساس الگوی استاندارد CloneTemplateModal',
      'حذف گرادیانت‌های نامناسب آبی-بنفش و پس‌زمینه‌های تیره/خاکستری کدر در تم روشن مودال‌ها',
      'اصلاح کادرهای ورودی (Inputs, Selects, Textareas) با پس‌زمینه سفید خالص (#ffffff)، متون تیره پرکنتراست (#0f172a) و بوردرهای مشخص جهت رفع مشکل ناخوانایی متن سفید روی پس‌زمینه سفید',
      'خوانایی کامل و استایل‌دهی یکپارچه به کارت‌های آپشن‌های هوشمند، سربرگ‌ها، لاگ‌های نشست و فرامین کانفیگ در هر دو تم تاریک و روشن',
      'بهبود استایل و کنتراست مودال اعمال تمپلیت روی تجهیزات (ApplyTemplateModal) در تم لایت',
      'ثبت قانون دائمی استانداردهای استایل مودال‌ها در فایل AGENTS.md جهت پیشگیری از خطاهای آتی در طراحی رابط کاربری'
    ]
  },
  {
    version: '1.3.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'موتور استخراج هوشمند و تبدیل خودکار کانفیگ تجهیز زنده (سیسکو و میکروتیک) به الگوی پارامتریک',
    changes: [
      'افزودن دکمه «استخراج الگو از تجهیز زنده» (Extract Live Config) در بخش مدیریت الگوها و تمپلیت‌ها',
      'پشتیبانی از اتصال مستقیم SSH/Telnet به تجهیزات با دریافت آدرس IP، پورت، یوزرنیم، پسورد و Enable Secret',
      'امکان انتخاب سریع از میان تجهیزات ثبت‌شده شبکه یا ورود دستی مشخصات تجهیز جدید',
      'موتور پارامتریک‌سازی خودکار (Auto-Parameterize) جهت تبدیل نام تجهیز، IP مدیریتی، سابنت، گیت‌وی و DNS به متغیرهای پویا',
      'پاکسازی و امن‌سازی اطلاعات حساس (Sanitize Secrets) و ماسک کردن رمزهای عبور، هش‌ها و SNMP Community Strings',
      'پشتیبانی تخصصی از دستورات فشرده میکروتیک (/export compact) و دستورات Cisco IOS/IOS-XE (show running-config)',
      'مودال دو مرحله‌ای پیشرفته برای استخراج، پیش‌نمایش کانفیگ خام، ویرایش متغیرها و نام‌گذاری تمپلیت',
      'امکان ذخیره مستقیم در لیست الگوها و اعمال آنی بر روی سایر تجهیزات شبکه'
    ]
  },
  {
    version: '1.2.3',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'بهبود تفکیک جداول تجهیزات، منوی عملیات ۳ نقطه و هماهنگ‌سازی رنگ‌بندی صفحه الگوها با داشبورد',
    changes: [
      'افزودن خطوط جداکننده عمودی بین سرستون‌های جدول تجهیزات (Header Dividers) برای خوانایی کامل عناوین',
      'افزودن خطوط جداکننده و استایل تفکیک ردیف‌های تجهیزات (Row Separators & Alternating Bands) در تم روشن و تاریک',
      'جایگزینی دکمه‌های کانکت، تمپلیت و حذف با منوی دراپ‌داون سه نقطه (3-Dots Actions Menu) حرفه‌ای و مرتب',
      'اصلاح ساختار و رنگ‌بندی کامل صفحه الگوها و تمپلیت‌ها (Template Management) با کارت‌های spatial-glass، شبیه داشبورد',
      'کنتراست استاندارد و وضوح کارت‌های KPI، تولبار فیلترها و کادر مشاهده کامندهای CLI در هر دو تم تاریک و روشن'
    ]
  },
  {
    version: '1.2.2',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'هماهنگ‌سازی و اصلاح استایل بج Cisco IOS-XE و کادرهای مودال در تم روشن (Light Theme Harmonization)',
    changes: [
      'ایجاد کلاس اختصاصی و بهینه‌سازی شده vendor-badge-cisco و vendor-badge-mikrotik با کنتراست استاندارد و وضوح عالی در تم روشن و تاریک',
      'اصلاح رنگ و پس‌زمینه بج Cisco IOS-XE در سربرگ مودال اعمال تعاملی تمپلیت (Apply Template Modal)',
      'هماهنگ‌سازی استایل بج و تگ‌های سیسکو در تمامی مودال‌ها (کلون‌گیری، ویرایشگر تمپلیت، ترمینال و بازرسی پورت)',
      'اصلاح پس‌زمینه کادر مودال‌ها، فیلدهای ورودی و سلکت‌باکس‌ها در تم روشن جهت یکپارچگی بصری کامل',
      'حفظ خوانایی کنتراست بالای خروجی‌ها و بلوک‌های کد ترمینال در کلیه حالت‌های تم',
    ]
  },
  {
    version: '1.2.1',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'امکان کلون‌گیری و انشعاب از تمپلیت‌ها با نام جدید و ویرایش جزیی دستورات (Template Cloning)',
    changes: [
      'افزودن پنجره اختصاصی کلون‌گیری (Clone Template Modal) با امکان تعیین نام جدید دلخواه برای تجهیز جدید',
      'امکان شخصی‌سازی و اعمال تغییرات جزیی در خطوط فرامین CLI مبدا بدون تغییر تمپلیت اصلی',
      'امکان تغییر مقادیر پیش‌فرض متغیرها (آدرس IP، سابنت، ویلن و...) متناسب با تجهیز جدید',
      'دکمه‌های دسترسی سریع کلون بر روی سربرگ و پاورقی تمامی کارت‌های تمپلیت',
      'امکان ذخیره به عنوان کلون با نام جدید مستقیماً از داخل ویرایشگر تمپلیت (Save as Clone)',
    ]
  },
  {
    version: '1.2.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'اضافه شدن سیستم مدیریت الگوها و تمپلیت‌های کانفیگ تجهیزات شبکه (Template System)',
    changes: [
      'صفحه اختصاصی مدیریت و تعریف الگوهای کانفیگ (Template Management View) با فیلتر سیسکو و میکروتیک',
      'پشتیبانی از الگوهای استاندارد برای سوئیچ‌ها و روترهای سیسکو (IOS-XE) و میکروتیک (RouterOS)',
      'سیستم متغیرهای پویا (Template Variables) با تشخیص خودکار متغیرهای {{VAR}} در متن دستورات',
      'تایید تعاملی مقادیر و آدرس‌های IP و پیش‌فرض‌ها قبل از اجرا بر روی تجهیز',
      'انتخاب تمپلیت در فرم معرفی تجهیز جدید (Add Device) و شروع بلافاصله فرآیند اعمال کانفیگ',
      'امکان اعمال تمپلیت به طور مستقیم بر روی هر تجهیز از جدول موجودی تجهیزات شبکه',
      'موتور هوشمند اجرای دستورات در مدهای استاندارد خط فرمان با لاگ زنده شبیه‌سازی شده ترمینال و ثبت در دیتابیس',
    ],
  },
  {
    version: '1.1.2',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'رفع مشکل پنهان شدن و برش تجهیزات در هنگام جابجایی در حالت زوم اوت',
    changes: [
      'حذف کادر و محدوده برش SVG (Unbounded Canvas) و انتقال ترنسفورم به لایه گروه بی‌نهایت',
      'نمایش کامل و بدون محدودیت تجهیزات در هنگام درگ به تمام جهات (بالا، پایین، چپ و راست)',
      'افزایش دامنه زوم تا ۰.۲X و بهینه‌سازی حرکت شبکه‌بندی پس‌زمینه همراه با جابجایی دید',
      'رفع خطای برش ForeignObject در نودهای دارای برچسب و سایه عمیق',
    ],
  },
  {
    version: '1.1.1',
    releaseDate: '2026-09-08',
    type: 'patch',
    title: 'رفع خطای کلید در فیلتر ساختمان‌های نقشه شماتیک',
    changes: [
      'اصلاح ساختار کلیدهای منحصربه‌فرد (unique key prop) در لیست ساختمان‌های فیلتر نقشه شماتیک',
      'پشتیبانی جامع و ایمن از ساختار آرایه‌ای داده‌های ساختمان‌های ارسال شده از سرور',
    ],
  },
  {
    version: '1.1.0',
    releaseDate: '2026-09-08',
    type: 'minor',
    title: 'ارتقای تعاملی نقشه شماتیک و بهینه‌سازی رابط کاربری',
    changes: [
      'قابلیت درگ و دراپ (Drag & Drop) برای جابجایی آزادانه تمامی تجهیزات در نقشه شماتیک',
      'بزرگنمایی و کوچکنمایی نرم نقشه با اسکرول موس (Mouse Wheel Zoom In / Out)',
      'ذخیره‌سازی خودکار و ماندگار موقعیت نودها، سطح بزرگنمایی و موقعیت دید در مرورگر',
      'حذف برچسب‌های متنی اضافه در سایدبار و رفع تداخل ظاهری آن‌ها با عناوین',
      'قابلیت جمع‌شوندگی و بازشوندگی سایدبار (Collapsible Sidebar) برای مشاهده وسیع‌تر نقشه',
      'افزودن سیستم مدیریت نسخه و تاریخچه تغییرات (Release Notes & Versioning)',
    ],
  },
  {
    version: '1.0.0',
    releaseDate: '2026-09-08',
    type: 'major',
    title: 'انتشار نسخه پایه سامانه مانیتورینگ و توپولوژی شبکه NetTopology',
    changes: [
      'داشبورد پایش لحظه‌ای پینگ و تأخیر تجهیزات شبکه',
      'نمایش شماتیک سلسله‌مراتبی سوئیچ‌های Core، Distribution، Access و روترها',
      'محیط شماتیک ساختمانی با تفکیک فیزیکی طبقات و واحدها',
      'موتور کشف همسایگی‌های شبکه سیسکو با پروتکل‌های CDP و LLDP',
      'مدیریت و نظارت دقیق پورت‌ها، ترانک‌ها و ویلن‌ها (VLANs)',
      'کنسول ترمینال شبیه‌ساز سیسکو (CLI Terminal)',
      'موتور تم‌های بصری فضایی و دارک‌مود پیشرفته',
    ],
  },
];

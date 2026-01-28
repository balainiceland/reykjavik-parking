<?php
/**
 * Plugin Name: Krage
 * Plugin URI: https://krage.com
 * Description: Premium collar protectors for high-quality dress shirts. Clean Scandinavian e-commerce.
 * Version: 1.0.0
 * Author: Krage
 * License: GPL v2 or later
 * Text Domain: krage
 */

if (!defined('ABSPATH')) exit;

class Krage {

    private static $instance = null;
    const VERSION = '1.0.0';

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('init', [$this, 'register_shortcodes']);
        add_action('wp_ajax_krage_contact', [$this, 'handle_contact_form']);
        add_action('wp_ajax_nopriv_krage_contact', [$this, 'handle_contact_form']);
    }

    public function enqueue_assets() {
        wp_enqueue_style(
            'krage-style',
            plugin_dir_url(__FILE__) . 'css/style.css',
            [],
            self::VERSION
        );

        wp_enqueue_style(
            'krage-fonts',
            'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&family=Montserrat:wght@500;600;700&display=swap',
            [],
            null
        );

        wp_enqueue_script(
            'krage-main',
            plugin_dir_url(__FILE__) . 'js/main.js',
            [],
            self::VERSION,
            true
        );

        wp_localize_script('krage-main', 'krageAjax', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('krage_contact_nonce')
        ]);

        // Snipcart
        $api_key = get_option('krage_snipcart_key', '');
        if (!empty($api_key)) {
            wp_enqueue_style('snipcart-style', 'https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css', [], null);
            add_action('wp_footer', function() use ($api_key) {
                echo '<div hidden id="snipcart" data-api-key="' . esc_attr($api_key) . '"></div>';
                echo '<script async src="https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.js"></script>';
            });
        }
    }

    public function add_admin_menu() {
        add_options_page(
            'Krage Settings',
            'Krage',
            'manage_options',
            'krage-settings',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings() {
        register_setting('krage_options', 'krage_snipcart_key');
        register_setting('krage_options', 'krage_product_name');
        register_setting('krage_options', 'krage_product_price');
        register_setting('krage_options', 'krage_product_description');
        register_setting('krage_options', 'krage_contact_email');
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) return;
        ?>
        <div class="wrap">
            <h1>Krage Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('krage_options'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="krage_snipcart_key">Snipcart API Key</label></th>
                        <td>
                            <input type="text" id="krage_snipcart_key" name="krage_snipcart_key"
                                   value="<?php echo esc_attr(get_option('krage_snipcart_key')); ?>"
                                   class="regular-text" placeholder="Enter your Snipcart public API key">
                            <p class="description">Get your API key from <a href="https://snipcart.com" target="_blank">snipcart.com</a></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="krage_product_name">Product Name</label></th>
                        <td>
                            <input type="text" id="krage_product_name" name="krage_product_name"
                                   value="<?php echo esc_attr(get_option('krage_product_name', 'Krage Collar Protector')); ?>"
                                   class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="krage_product_price">Product Price</label></th>
                        <td>
                            <input type="number" id="krage_product_price" name="krage_product_price"
                                   value="<?php echo esc_attr(get_option('krage_product_price', '29')); ?>"
                                   step="0.01" min="0" class="small-text"> USD
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="krage_product_description">Product Description</label></th>
                        <td>
                            <textarea id="krage_product_description" name="krage_product_description"
                                      rows="4" class="large-text"><?php echo esc_textarea(get_option('krage_product_description', 'Premium collar protectors that keep your finest dress shirts looking immaculate. Invisible protection, visible confidence.')); ?></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="krage_contact_email">Contact Form Email</label></th>
                        <td>
                            <input type="email" id="krage_contact_email" name="krage_contact_email"
                                   value="<?php echo esc_attr(get_option('krage_contact_email', get_option('admin_email'))); ?>"
                                   class="regular-text">
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function register_shortcodes() {
        add_shortcode('krage_home', [$this, 'shortcode_home']);
        add_shortcode('krage_product', [$this, 'shortcode_product']);
        add_shortcode('krage_about', [$this, 'shortcode_about']);
        add_shortcode('krage_faq', [$this, 'shortcode_faq']);
        add_shortcode('krage_contact', [$this, 'shortcode_contact']);
        add_shortcode('krage_cart', [$this, 'shortcode_cart']);
        add_shortcode('krage_logo', [$this, 'shortcode_logo']);
    }

    // =========================================================================
    // SHORTCODE: LOGO
    // =========================================================================
    public function shortcode_logo($atts) {
        $atts = shortcode_atts(['size' => '150'], $atts);
        $logo = plugin_dir_url(__FILE__) . 'images/logo.png';
        return '<img src="' . esc_url($logo) . '" alt="Krage" class="krage-logo" style="max-width:' . intval($atts['size']) . 'px;height:auto;">';
    }

    // =========================================================================
    // SHORTCODE: HOME
    // =========================================================================
    public function shortcode_home($atts) {
        $product_name = get_option('krage_product_name', 'Krage Collar Protector');
        $product_price = get_option('krage_product_price', '29');
        $product_desc = get_option('krage_product_description', 'Premium collar protectors for your finest dress shirts.');
        $img_base = plugin_dir_url(__FILE__) . 'images/';

        // Image paths
        $logo = $img_base . 'logo.png';
        $hero_img = $img_base . 'hero.png';
        $product_hand = $img_base . 'product-hand.png';
        $packaging = $img_base . 'packaging.png';
        $packaging_elegant = $img_base . 'packaging-elegant.png';
        $packaging_minimalist = $img_base . 'packaging-minimalist.png';
        $lifestyle = $img_base . 'lifestyle.png';
        $lifestyle_morning = $img_base . 'lifestyle-morning.png';
        $lifestyle_office = $img_base . 'lifestyle-office.png';
        $sustainability = $img_base . 'sustainability.png';
        $eco_decomposing = $img_base . 'eco-decomposing.png';
        $eco_bamboo = $img_base . 'eco-bamboo-leaves.png';
        $materials_bamboo = $img_base . 'materials-bamboo-hemp.png';
        $product_exploded = $img_base . 'product-exploded.png';
        $product_layers = $img_base . 'product-layers.png';
        $product_biodegradable = $img_base . 'product-biodegradable.png';
        $product_collar_fold = $img_base . 'product-collar-fold.png';

        ob_start();
        ?>
        <div class="krage-home">
            <!-- Hero Section -->
            <section class="krage-hero">
                <div class="krage-container krage-hero-grid">
                    <div class="krage-hero-content">
                        <img src="<?php echo esc_url($logo); ?>" alt="Krage" class="krage-hero-logo">
                        <h1>Protect Your Finest</h1>
                        <p class="krage-hero-subtitle">Eco-friendly collar protectors that keep your premium dress shirts looking immaculate, naturally.</p>
                        <div class="krage-hero-buttons">
                            <a href="#product" class="krage-btn krage-btn-primary">Shop Now</a>
                            <a href="#sustainability" class="krage-btn krage-btn-outline">Learn More</a>
                        </div>
                    </div>
                    <div class="krage-hero-image">
                        <img src="<?php echo esc_url($hero_img); ?>" alt="Krage Collar Protectors">
                    </div>
                </div>
            </section>

            <!-- Value Props -->
            <section class="krage-values">
                <div class="krage-container">
                    <h2 class="krage-section-title">Why Choose Krage?</h2>
                    <div class="krage-values-grid">
                        <div class="krage-value-item">
                            <div class="krage-value-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            </div>
                            <h3>Protect</h3>
                            <p>Shield your collars from sweat, oils, and daily wear. Extend the life of your premium shirts.</p>
                        </div>
                        <div class="krage-value-item">
                            <div class="krage-value-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <h3>Sustainable</h3>
                            <p>100% biodegradable materials. Good for your shirts, better for the planet.</p>
                        </div>
                        <div class="krage-value-item">
                            <div class="krage-value-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                                </svg>
                            </div>
                            <h3>Premium</h3>
                            <p>Invisible protection, visible confidence. Look your best without compromise.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- How It Works Section -->
            <section class="krage-how-it-works" id="how-it-works">
                <div class="krage-container">
                    <span class="krage-label">Innovation</span>
                    <h2 class="krage-section-title">How It Works</h2>
                    <p class="krage-section-subtitle">Engineered for invisible, all-day protection</p>
                    <div class="krage-how-grid">
                        <div class="krage-how-step">
                            <div class="krage-how-image">
                                <img src="<?php echo esc_url($product_exploded); ?>" alt="Product layers explained">
                            </div>
                            <div class="krage-how-number">01</div>
                            <h3>Multi-Layer Design</h3>
                            <p>Our patented design uses multiple ultra-thin layers to create a breathable yet effective barrier.</p>
                        </div>
                        <div class="krage-how-step">
                            <div class="krage-how-image">
                                <img src="<?php echo esc_url($product_layers); ?>" alt="Product structure">
                            </div>
                            <div class="krage-how-number">02</div>
                            <h3>Absorbent Core</h3>
                            <p>The inner layer absorbs sweat and oils before they reach your shirt, keeping collars pristine.</p>
                        </div>
                        <div class="krage-how-step">
                            <div class="krage-how-image">
                                <img src="<?php echo esc_url($product_collar_fold); ?>" alt="Easy application">
                            </div>
                            <div class="krage-how-number">03</div>
                            <h3>Simple Application</h3>
                            <p>Just fold and place inside your collar. Completely invisible and stays in place all day.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Materials Section -->
            <section class="krage-materials" id="materials">
                <div class="krage-container krage-materials-grid">
                    <div class="krage-materials-content">
                        <span class="krage-label">Natural Materials</span>
                        <h2>Crafted From Nature</h2>
                        <p>We source only the finest sustainable materials. Our collar protectors are made from a blend of organic bamboo fibers and natural hemp — materials chosen for their exceptional softness, breathability, and eco-friendly properties.</p>
                        <ul class="krage-materials-list">
                            <li>
                                <strong>Organic Bamboo</strong>
                                <span>Naturally antibacterial and moisture-wicking</span>
                            </li>
                            <li>
                                <strong>Natural Hemp</strong>
                                <span>Durable, breathable, and fully biodegradable</span>
                            </li>
                            <li>
                                <strong>Zero Synthetics</strong>
                                <span>No plastics, no microfibers, no harmful chemicals</span>
                            </li>
                        </ul>
                    </div>
                    <div class="krage-materials-images">
                        <img src="<?php echo esc_url($materials_bamboo); ?>" alt="Bamboo and hemp materials" class="krage-materials-main">
                        <img src="<?php echo esc_url($eco_bamboo); ?>" alt="Natural bamboo" class="krage-materials-accent">
                    </div>
                </div>
            </section>

            <!-- Featured Product -->
            <section class="krage-featured" id="product">
                <div class="krage-container krage-featured-grid">
                    <div class="krage-featured-image">
                        <img src="<?php echo esc_url($product_hand); ?>" alt="<?php echo esc_attr($product_name); ?>">
                    </div>
                    <div class="krage-featured-content">
                        <span class="krage-label">Featured</span>
                        <h2><?php echo esc_html($product_name); ?></h2>
                        <p><?php echo esc_html($product_desc); ?></p>
                        <ul class="krage-features-list">
                            <li>Invisible under any collar</li>
                            <li>Absorbs sweat and oils</li>
                            <li>100% biodegradable</li>
                            <li>Hypoallergenic materials</li>
                        </ul>
                        <div class="krage-price">$<?php echo esc_html($product_price); ?></div>
                        <?php echo $this->get_add_to_cart_button(); ?>
                    </div>
                </div>
            </section>

            <!-- Sustainability Section -->
            <section class="krage-sustainability" id="sustainability">
                <div class="krage-container krage-sustainability-grid">
                    <div class="krage-sustainability-content">
                        <span class="krage-label">Eco-Friendly</span>
                        <h2>Better for You, Better for Earth</h2>
                        <p>Every Krage protector is made from 100% biodegradable materials. Our packaging is plastic-free and fully recyclable.</p>
                        <p>By extending the life of your shirts, you're reducing waste and your environmental footprint.</p>
                        <div class="krage-eco-stats">
                            <div class="krage-eco-stat">
                                <span class="krage-stat-number">100%</span>
                                <span class="krage-stat-label">Biodegradable</span>
                            </div>
                            <div class="krage-eco-stat">
                                <span class="krage-stat-number">0</span>
                                <span class="krage-stat-label">Plastic Used</span>
                            </div>
                            <div class="krage-eco-stat">
                                <span class="krage-stat-number">2x</span>
                                <span class="krage-stat-label">Shirt Lifespan</span>
                            </div>
                        </div>
                    </div>
                    <div class="krage-sustainability-images">
                        <img src="<?php echo esc_url($eco_decomposing); ?>" alt="Biodegradable decomposition" class="krage-eco-main">
                        <img src="<?php echo esc_url($product_biodegradable); ?>" alt="Biodegradable product" class="krage-eco-accent">
                    </div>
                </div>
            </section>

            <!-- Packaging Section -->
            <section class="krage-packaging">
                <div class="krage-container krage-packaging-grid">
                    <div class="krage-packaging-images">
                        <img src="<?php echo esc_url($packaging_elegant); ?>" alt="Elegant packaging" class="krage-packaging-main">
                        <img src="<?php echo esc_url($packaging_minimalist); ?>" alt="Minimalist packaging" class="krage-packaging-secondary">
                    </div>
                    <div class="krage-packaging-content">
                        <span class="krage-label">Thoughtful Packaging</span>
                        <h2>Unboxing Experience</h2>
                        <p>Our packaging reflects our values: elegant yet responsible. Every box is made from recycled materials and designed to be reused or recycled.</p>
                        <ul class="krage-packaging-features">
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>100% recycled cardboard</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Soy-based inks</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Zero plastic packaging</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Designed to be reused</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <!-- Lifestyle Section -->
            <section class="krage-lifestyle">
                <div class="krage-container">
                    <span class="krage-label">For Professionals</span>
                    <h2 class="krage-section-title">Confidence That Lasts All Day</h2>
                    <p class="krage-section-subtitle">From morning meetings to evening events, Krage keeps you looking sharp</p>

                    <div class="krage-lifestyle-gallery">
                        <div class="krage-lifestyle-item krage-lifestyle-large">
                            <img src="<?php echo esc_url($lifestyle); ?>" alt="Professional in office">
                            <div class="krage-lifestyle-caption">
                                <h4>Office Ready</h4>
                                <p>Command attention in every meeting</p>
                            </div>
                        </div>
                        <div class="krage-lifestyle-item">
                            <img src="<?php echo esc_url($lifestyle_morning); ?>" alt="Morning routine">
                            <div class="krage-lifestyle-caption">
                                <h4>Morning Fresh</h4>
                                <p>Start your day with confidence</p>
                            </div>
                        </div>
                        <div class="krage-lifestyle-item">
                            <img src="<?php echo esc_url($lifestyle_office); ?>" alt="Professional workspace">
                            <div class="krage-lifestyle-caption">
                                <h4>All Day Sharp</h4>
                                <p>From first call to last handshake</p>
                            </div>
                        </div>
                    </div>

                    <div class="krage-lifestyle-cta">
                        <p>No more collar stains. No more mid-day wardrobe worries. Just pure, effortless confidence.</p>
                        <a href="#product" class="krage-btn krage-btn-primary">Get Started</a>
                    </div>
                </div>
            </section>
        </div>
        <?php
        return ob_get_clean();
    }

    // =========================================================================
    // SHORTCODE: PRODUCT
    // =========================================================================
    public function shortcode_product($atts) {
        $product_name = get_option('krage_product_name', 'Krage Collar Protector');
        $product_price = get_option('krage_product_price', '29');
        $product_desc = get_option('krage_product_description', 'Premium collar protectors for your finest dress shirts.');
        $img_base = plugin_dir_url(__FILE__) . 'images/';

        // Product gallery images
        $product_img_1 = $img_base . 'product-1.png';
        $product_img_2 = $img_base . 'product-2.png';
        $product_hand = $img_base . 'product-hand.png';
        $product_hands = $img_base . 'product-hands.png';
        $product_layers = $img_base . 'product-layers.png';
        $product_exploded = $img_base . 'product-exploded.png';
        $product_collar_fold = $img_base . 'product-collar-fold.png';
        $packaging = $img_base . 'packaging-elegant.png';

        ob_start();
        ?>
        <div class="krage-product-page">
            <div class="krage-container">
                <div class="krage-product-grid">
                    <div class="krage-product-gallery">
                        <div class="krage-product-main-image">
                            <img src="<?php echo esc_url($product_img_1); ?>" alt="<?php echo esc_attr($product_name); ?>" id="krage-main-img">
                        </div>
                        <div class="krage-product-thumbnails">
                            <img src="<?php echo esc_url($product_img_1); ?>" alt="Product front" class="krage-thumb active">
                            <img src="<?php echo esc_url($product_img_2); ?>" alt="Product detail" class="krage-thumb">
                            <img src="<?php echo esc_url($product_hand); ?>" alt="In hand" class="krage-thumb">
                            <img src="<?php echo esc_url($product_layers); ?>" alt="Product layers" class="krage-thumb">
                            <img src="<?php echo esc_url($product_exploded); ?>" alt="Product design" class="krage-thumb">
                            <img src="<?php echo esc_url($product_collar_fold); ?>" alt="Application" class="krage-thumb">
                            <img src="<?php echo esc_url($packaging); ?>" alt="Packaging" class="krage-thumb">
                        </div>
                    </div>
                    <div class="krage-product-info">
                        <h1><?php echo esc_html($product_name); ?></h1>
                        <div class="krage-product-price">$<?php echo esc_html($product_price); ?></div>
                        <p class="krage-product-desc"><?php echo esc_html($product_desc); ?></p>

                        <div class="krage-product-options">
                            <label class="krage-label">Quantity</label>
                            <div class="krage-quantity">
                                <button type="button" class="krage-qty-btn" data-action="decrease">-</button>
                                <input type="number" value="1" min="1" max="99" id="krage-qty" class="krage-qty-input">
                                <button type="button" class="krage-qty-btn" data-action="increase">+</button>
                            </div>
                        </div>

                        <?php echo $this->get_add_to_cart_button(); ?>

                        <div class="krage-product-details">
                            <div class="krage-accordion">
                                <div class="krage-accordion-item">
                                    <button class="krage-accordion-header">
                                        <span>Materials</span>
                                        <span class="krage-accordion-icon">+</span>
                                    </button>
                                    <div class="krage-accordion-content">
                                        <p>Made from premium, breathable materials that are gentle on your skin and fabric. Hypoallergenic and dermatologist tested.</p>
                                    </div>
                                </div>
                                <div class="krage-accordion-item">
                                    <button class="krage-accordion-header">
                                        <span>How to Use</span>
                                        <span class="krage-accordion-icon">+</span>
                                    </button>
                                    <div class="krage-accordion-content">
                                        <p>Simply apply to the inside of your collar before wearing. Remove after use. Each protector can be used multiple times.</p>
                                    </div>
                                </div>
                                <div class="krage-accordion-item">
                                    <button class="krage-accordion-header">
                                        <span>Shipping</span>
                                        <span class="krage-accordion-icon">+</span>
                                    </button>
                                    <div class="krage-accordion-content">
                                        <p>Free shipping on orders over $50. Standard delivery takes 3-5 business days. Express shipping available at checkout.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    // =========================================================================
    // SHORTCODE: ABOUT
    // =========================================================================
    public function shortcode_about($atts) {
        $img_base = plugin_dir_url(__FILE__) . 'images/';
        $logo = $img_base . 'logo.png';
        $sustainability = $img_base . 'sustainability.png';
        $lifestyle = $img_base . 'lifestyle.png';
        $packaging = $img_base . 'packaging.png';

        ob_start();
        ?>
        <div class="krage-about-page">
            <!-- Story Section -->
            <section class="krage-about-hero">
                <div class="krage-container">
                    <img src="<?php echo esc_url($logo); ?>" alt="Krage" class="krage-about-logo">
                    <span class="krage-label">Our Story</span>
                    <h1>Crafted for Those Who Care</h1>
                    <p class="krage-about-intro">Krage was born from a simple frustration: why do premium dress shirts lose their crisp, professional look so quickly? We set out to solve this problem with sustainable materials and Scandinavian design.</p>
                </div>
            </section>

            <!-- Mission Section -->
            <section class="krage-about-mission">
                <div class="krage-container krage-about-grid">
                    <div class="krage-about-image">
                        <img src="<?php echo esc_url($sustainability); ?>" alt="Sustainable materials">
                    </div>
                    <div class="krage-about-content">
                        <h2>Our Mission</h2>
                        <p>We believe that taking care of your appearance shouldn't be complicated. Our collar protectors are designed to seamlessly integrate into your daily routine, providing invisible protection that lets you focus on what matters most.</p>
                        <p>Every Krage product is thoughtfully designed in Scandinavia, where functionality meets minimalist elegance. We use only the finest materials that are gentle on both your skin and your garments.</p>
                    </div>
                </div>
            </section>

            <!-- Values Section -->
            <section class="krage-about-values">
                <div class="krage-container">
                    <h2>What We Stand For</h2>
                    <div class="krage-values-grid">
                        <div class="krage-value-item">
                            <h3>Quality</h3>
                            <p>We never compromise on materials or craftsmanship. Every product is made to last.</p>
                        </div>
                        <div class="krage-value-item">
                            <h3>Simplicity</h3>
                            <p>Good design is invisible. Our products work seamlessly without adding complexity.</p>
                        </div>
                        <div class="krage-value-item">
                            <h3>Sustainability</h3>
                            <p>By extending the life of your shirts, we help reduce waste and environmental impact.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <?php
        return ob_get_clean();
    }

    // =========================================================================
    // SHORTCODE: FAQ
    // =========================================================================
    public function shortcode_faq($atts) {
        $faqs = [
            [
                'q' => 'How do Krage collar protectors work?',
                'a' => 'Krage collar protectors create a thin, breathable barrier between your skin and your shirt collar. They absorb sweat and oils before they can reach the fabric, keeping your collar clean and crisp throughout the day.'
            ],
            [
                'q' => 'Are they visible when wearing?',
                'a' => 'No, Krage protectors are designed to be completely invisible. They sit on the inside of your collar and are thin enough that they won\'t be noticed by you or anyone else.'
            ],
            [
                'q' => 'How many times can I reuse each protector?',
                'a' => 'Each Krage protector can be used 3-5 times depending on conditions. We recommend replacing them when they start to show visible wear or reduced effectiveness.'
            ],
            [
                'q' => 'Will they work with all shirt types?',
                'a' => 'Yes, Krage protectors are designed to work with all collar styles including spread, point, button-down, and cutaway collars. They\'re suitable for both dress shirts and casual button-ups.'
            ],
            [
                'q' => 'Are the materials hypoallergenic?',
                'a' => 'Yes, all Krage products are made from hypoallergenic materials that have been dermatologist tested. They\'re safe for sensitive skin and won\'t cause irritation.'
            ],
            [
                'q' => 'What is your return policy?',
                'a' => 'We offer a 30-day satisfaction guarantee. If you\'re not completely happy with your purchase, contact us for a full refund or exchange.'
            ],
            [
                'q' => 'Do you ship internationally?',
                'a' => 'Yes, we ship worldwide. Shipping costs and delivery times vary by location. Free shipping is available for orders over $50 within the US and EU.'
            ]
        ];

        ob_start();
        ?>
        <div class="krage-faq-page">
            <div class="krage-container krage-container-narrow">
                <div class="krage-faq-header">
                    <span class="krage-label">Support</span>
                    <h1>Frequently Asked Questions</h1>
                    <p>Everything you need to know about Krage collar protectors.</p>
                </div>

                <div class="krage-faq-list">
                    <?php foreach ($faqs as $i => $faq): ?>
                    <div class="krage-faq-item">
                        <button class="krage-faq-question">
                            <span><?php echo esc_html($faq['q']); ?></span>
                            <span class="krage-faq-icon">+</span>
                        </button>
                        <div class="krage-faq-answer">
                            <p><?php echo esc_html($faq['a']); ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>

                <div class="krage-faq-cta">
                    <p>Still have questions?</p>
                    <a href="/contact" class="krage-btn krage-btn-outline">Contact Us</a>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    // =========================================================================
    // SHORTCODE: CONTACT
    // =========================================================================
    public function shortcode_contact($atts) {
        ob_start();
        ?>
        <div class="krage-contact-page">
            <div class="krage-container krage-container-narrow">
                <div class="krage-contact-header">
                    <span class="krage-label">Get in Touch</span>
                    <h1>Contact Us</h1>
                    <p>Have a question or feedback? We'd love to hear from you.</p>
                </div>

                <form class="krage-contact-form" id="krage-contact-form">
                    <div class="krage-form-group">
                        <label for="krage-name">Name</label>
                        <input type="text" id="krage-name" name="name" required>
                    </div>
                    <div class="krage-form-group">
                        <label for="krage-email">Email</label>
                        <input type="email" id="krage-email" name="email" required>
                    </div>
                    <div class="krage-form-group">
                        <label for="krage-subject">Subject</label>
                        <select id="krage-subject" name="subject">
                            <option value="general">General Inquiry</option>
                            <option value="order">Order Question</option>
                            <option value="return">Returns & Exchanges</option>
                            <option value="wholesale">Wholesale Inquiry</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="krage-form-group">
                        <label for="krage-message">Message</label>
                        <textarea id="krage-message" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="krage-btn krage-btn-primary krage-btn-full">Send Message</button>
                    <div class="krage-form-status" id="krage-form-status"></div>
                </form>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    // =========================================================================
    // SHORTCODE: CART
    // =========================================================================
    public function shortcode_cart($atts) {
        return '<a href="#" class="snipcart-checkout krage-cart-icon" aria-label="Shopping cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="snipcart-items-count krage-cart-count"></span>
        </a>';
    }

    // =========================================================================
    // HELPERS
    // =========================================================================
    private function get_add_to_cart_button() {
        $api_key = get_option('krage_snipcart_key', '');
        $product_name = get_option('krage_product_name', 'Krage Collar Protector');
        $product_price = get_option('krage_product_price', '29');
        $product_desc = get_option('krage_product_description', 'Premium collar protectors');
        $product_img = plugin_dir_url(__FILE__) . 'images/product-1.png';

        if (empty($api_key)) {
            return '<p class="krage-notice">Please configure your Snipcart API key in Settings > Krage</p>';
        }

        return sprintf(
            '<button class="snipcart-add-item krage-btn krage-btn-primary"
                data-item-id="krage-001"
                data-item-name="%s"
                data-item-price="%s"
                data-item-url="%s"
                data-item-description="%s"
                data-item-image="%s">
                Add to Cart - $%s
            </button>',
            esc_attr($product_name),
            esc_attr($product_price),
            esc_url(get_permalink()),
            esc_attr(wp_trim_words($product_desc, 10)),
            esc_url($product_img),
            esc_html($product_price)
        );
    }

    public function handle_contact_form() {
        check_ajax_referer('krage_contact_nonce', 'nonce');

        $name = sanitize_text_field($_POST['name'] ?? '');
        $email = sanitize_email($_POST['email'] ?? '');
        $subject = sanitize_text_field($_POST['subject'] ?? 'General Inquiry');
        $message = sanitize_textarea_field($_POST['message'] ?? '');

        if (empty($name) || empty($email) || empty($message)) {
            wp_send_json_error(['message' => 'Please fill in all required fields.']);
        }

        $to = get_option('krage_contact_email', get_option('admin_email'));
        $email_subject = sprintf('[Krage] %s from %s', ucfirst($subject), $name);
        $email_body = sprintf(
            "Name: %s\nEmail: %s\nSubject: %s\n\nMessage:\n%s",
            $name,
            $email,
            ucfirst($subject),
            $message
        );
        $headers = [
            'Content-Type: text/plain; charset=UTF-8',
            'Reply-To: ' . $name . ' <' . $email . '>'
        ];

        $sent = wp_mail($to, $email_subject, $email_body, $headers);

        if ($sent) {
            wp_send_json_success(['message' => 'Thank you! Your message has been sent.']);
        } else {
            wp_send_json_error(['message' => 'Sorry, there was an error sending your message. Please try again.']);
        }
    }
}

// Initialize
Krage::instance();

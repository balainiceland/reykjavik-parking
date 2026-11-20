<?php
/**
 * Plugin Name: Iceland Investor Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic investors, VCs, angels, and funding sources
 * Version: 1.2.0
 * Author: Startup Iceland
 * Author URI: https://startupiceland.com
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

class Iceland_Investor_Directory {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'register_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    public function register_shortcode() {
        add_shortcode('investor_directory', array($this, 'render_directory'));
    }

    public function enqueue_assets() {
        global $post;

        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'investor_directory')) {
            wp_enqueue_style(
                'iid-styles',
                plugin_dir_url(__FILE__) . 'css/investor-directory.css',
                array(),
                '1.2.0'
            );

            wp_enqueue_script(
                'iid-data',
                plugin_dir_url(__FILE__) . 'js/investors-data.js',
                array(),
                '1.2.0',
                true
            );

            wp_enqueue_script(
                'iid-main',
                plugin_dir_url(__FILE__) . 'js/investor-directory.js',
                array('iid-data'),
                '1.2.0',
                true
            );
        }
    }

    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'show_stats' => 'true',
            'show_cta' => 'true',
            'type' => 'all'
        ), $atts, 'investor_directory');

        ob_start();
        ?>
        <div id="iid-directory-container" class="iid-directory-container">
            <!-- Hero: counts are filled in by JS from the investor data -->
            <header class="iid-hero">
                <p class="iid-hero-eyebrow">Startup Iceland · Investors</p>
                <h1 class="iid-hero-title">Investors in Icelandic startups</h1>
                <p class="iid-hero-lead">Iceland’s startup ecosystem is backed by a growing network of venture capital firms, angel investors, government funds and accelerators. Use this directory to find the right funding partner for your stage and sector.</p>
                <?php if ($atts['show_stats'] === 'true'): ?>
                <div class="iid-hero-stats">
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-total">–</span><span class="iid-hero-label">investors listed</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-vc">–</span><span class="iid-hero-label">venture capital firms</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value" id="iid-stat-angel">–</span><span class="iid-hero-label">angel investors</span></div>
                    <div class="iid-hero-stat"><span class="iid-hero-value is-accent" id="iid-stat-government">–</span><span class="iid-hero-label">funds and accelerators</span></div>
                </div>
                <?php endif; ?>
                <a class="iid-hero-link" href="/iceland-startup-directory/">Browse Iceland’s startups
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </header>

            <!-- Search and filters -->
            <section class="iid-controls" aria-label="Search and filter investors">
                <label class="iid-search-wrapper" for="iid-search">
                    <span class="iid-search-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
                    <span class="screen-reader-text">Search investors</span>
                    <input type="search" id="iid-search" placeholder="Search investors or portfolios" />
                </label>
                <div class="iid-filter-row">
                    <label class="iid-filter-wrapper" for="iid-type-filter">Type
                        <select id="iid-type-filter">
                            <option value="all">All types</option>
                        </select>
                    </label>
                    <label class="iid-filter-wrapper" for="iid-stage-filter">Stage
                        <select id="iid-stage-filter">
                            <option value="all">All stages</option>
                        </select>
                    </label>
                    <label class="iid-filter-wrapper" for="iid-sector-filter">Sector
                        <select id="iid-sector-filter">
                            <option value="all">All sectors</option>
                        </select>
                    </label>
                </div>
            </section>

            <!-- Count bar and sort -->
            <div class="iid-count-bar">
                <span>Showing <strong id="iid-showing-count">0</strong> investors</span>
                <label class="iid-sort-wrapper" for="iid-sort">Sort
                    <select id="iid-sort">
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="year-desc">Newest first</option>
                        <option value="year-asc">Oldest first</option>
                    </select>
                </label>
            </div>

            <!-- Investor Grid -->
            <div id="iid-investor-grid" class="iid-investor-grid">
                <!-- Cards populated by JavaScript -->
            </div>

            <?php if ($atts['show_cta'] === 'true'): ?>
            <!-- Call to Action -->
            <div class="iid-cta-box">
                <div class="iid-cta-content">
                    <h3>Are You an Investor?</h3>
                    <p>If you're an active investor in Icelandic startups and not listed here, we'd love to include you. Help founders find the right funding partners.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Investor%20Directory%20Submission&body=Investor%2FFund%20Name%3A%20%0AWebsite%3A%20%0AType%3A%20(VC%2FAngel%2FAccelerator%2FOther)%0AStages%3A%20(Pre-seed%2FSeed%2FSeries%20A%2Fetc.)%0AFocus%20Areas%3A%20%0ATypical%20Ticket%20Size%3A%20%0APortfolio%20Companies%3A%20%0ABrief%20Description%3A%20" class="iid-cta-button">Submit Your Profile</a>
                    <p class="iid-cta-note">You'll also be added to the Startup Iceland community updates.</p>
                </div>
            </div>
            <?php endif; ?>

        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Iceland_Investor_Directory::get_instance();

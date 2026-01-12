<?php
/**
 * Plugin Name: Iceland Investor Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic investors, VCs, angels, and funding sources
 * Version: 1.0.0
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
                '1.0.0'
            );

            wp_enqueue_script(
                'iid-data',
                plugin_dir_url(__FILE__) . 'js/investors-data.js',
                array(),
                '1.0.0',
                true
            );

            wp_enqueue_script(
                'iid-main',
                plugin_dir_url(__FILE__) . 'js/investor-directory.js',
                array('iid-data'),
                '1.0.0',
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

            <!-- Controls -->
            <div class="iid-controls">
                <div class="iid-search-row">
                    <div class="iid-search-wrapper">
                        <input type="text" id="iid-search" placeholder="Search investors, portfolio companies...">
                    </div>
                </div>
                <div class="iid-filter-row">
                    <div class="iid-filter-wrapper">
                        <select id="iid-type-filter">
                            <option value="all">All Types</option>
                        </select>
                    </div>
                    <div class="iid-filter-wrapper">
                        <select id="iid-stage-filter">
                            <option value="all">All Stages</option>
                        </select>
                    </div>
                    <div class="iid-filter-wrapper">
                        <select id="iid-sector-filter">
                            <option value="all">All Sectors</option>
                        </select>
                    </div>
                </div>
            </div>

            <?php if ($atts['show_stats'] === 'true'): ?>
            <!-- Stats Bar -->
            <div class="iid-stats-bar">
                <div class="iid-stat-item">
                    <span class="iid-stat-number" id="iid-stat-total">0</span>
                    <span class="iid-stat-label">Total Investors</span>
                </div>
                <div class="iid-stat-item">
                    <span class="iid-stat-number" id="iid-stat-vc">0</span>
                    <span class="iid-stat-label">Venture Capital</span>
                </div>
                <div class="iid-stat-item">
                    <span class="iid-stat-number" id="iid-stat-angel">0</span>
                    <span class="iid-stat-label">Angel Investors</span>
                </div>
                <div class="iid-stat-item">
                    <span class="iid-stat-number" id="iid-stat-government">0</span>
                    <span class="iid-stat-label">Funds & Accelerators</span>
                </div>
                <span class="iid-showing-text">Showing <strong id="iid-showing-count">0</strong> investors</span>
            </div>
            <?php endif; ?>

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

<?php
/**
 * Plugin Name: Startup Iceland Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic startups with filtering by sector and status.
 * Version: 1.0.0
 * Author: Startup Iceland
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Startup_Iceland_Directory {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('startup_directory', array($this, 'render_directory'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function enqueue_scripts() {
        global $post;

        // Only load on pages with our shortcode
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'startup_directory')) {
            // Plugin CSS
            wp_enqueue_style(
                'startup-directory-css',
                plugin_dir_url(__FILE__) . 'css/directory.css',
                array(),
                '1.0.0'
            );

            // Startup data
            wp_enqueue_script(
                'startup-directory-data',
                plugin_dir_url(__FILE__) . 'js/startups-data.js',
                array(),
                '1.0.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'startup-directory-js',
                plugin_dir_url(__FILE__) . 'js/directory.js',
                array('startup-directory-data'),
                '1.0.0',
                true
            );
        }
    }

    public function render_directory($atts) {
        $atts = shortcode_atts(array(
            'show_stats' => 'true'
        ), $atts);

        $show_stats = filter_var($atts['show_stats'], FILTER_VALIDATE_BOOLEAN);

        ob_start();
        ?>
        <div class="sid-directory-container" id="sid-directory-container">
            <!-- Search and Filters -->
            <div class="sid-controls">
                <div class="sid-search-row">
                    <div class="sid-search-wrapper">
                        <input type="text" id="sid-search" placeholder="Search startups..." />
                    </div>
                    <div class="sid-filter-wrapper">
                        <select id="sid-sector-filter">
                            <!-- Populated by JS -->
                        </select>
                    </div>
                </div>
                <div class="sid-filter-row">
                    <div class="sid-status-filters">
                        <button class="sid-status-btn sid-active" data-status="all">All</button>
                        <button class="sid-status-btn" data-status="active">Active</button>
                        <button class="sid-status-btn" data-status="acquired">Acquired</button>
                        <button class="sid-status-btn" data-status="exited">Exited</button>
                    </div>
                    <div class="sid-sort-wrapper">
                        <label for="sid-sort">Sort:</label>
                        <select id="sid-sort">
                            <option value="name-asc">A - Z</option>
                            <option value="name-desc">Z - A</option>
                            <option value="year-desc">Newest First</option>
                            <option value="year-asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            <?php if ($show_stats): ?>
            <!-- Stats Bar -->
            <div class="sid-stats-bar">
                <div class="sid-stat-item">
                    <span class="sid-stat-number" id="sid-stat-total">0</span>
                    <span class="sid-stat-label">Total Startups</span>
                </div>
                <div class="sid-stat-item">
                    <span class="sid-stat-number" id="sid-stat-active">0</span>
                    <span class="sid-stat-label">Active</span>
                </div>
                <div class="sid-stat-item">
                    <span class="sid-stat-number" id="sid-stat-acquired">0</span>
                    <span class="sid-stat-label">Acquired</span>
                </div>
                <div class="sid-showing-text">
                    Showing <strong id="sid-showing-count">0</strong> startups
                </div>
            </div>
            <?php endif; ?>

            <!-- Startup Grid -->
            <div class="sid-startup-grid" id="sid-startup-grid">
                <!-- Populated by JS -->
            </div>

            <!-- Call to Action -->
            <div class="sid-cta-box">
                <div class="sid-cta-content">
                    <h3>Know a startup that's missing?</h3>
                    <p>If you're a founder or investor and know of an Icelandic startup that should be on this list, we'd love to hear from you. Send us a note and we'll add them to the directory.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Startup%20Directory%20Submission&body=Hi%20Bala%2C%0A%0AI'd%20like%20to%20suggest%20a%20startup%20for%20the%20directory%3A%0A%0AStartup%20Name%3A%20%0AWebsite%3A%20%0ADescription%3A%20%0AFounded%20Year%3A%20%0ASector%3A%20%0A%0AThanks!" class="sid-cta-button">Submit a Startup</a>
                    <p class="sid-cta-note">By submitting, you'll also be added to the Startup Iceland mailing list for ecosystem updates.</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Startup_Iceland_Directory::get_instance();

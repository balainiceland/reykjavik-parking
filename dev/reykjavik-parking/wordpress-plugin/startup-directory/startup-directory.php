<?php
/**
 * Plugin Name: Startup Iceland Directory
 * Plugin URI: https://startupiceland.com
 * Description: Searchable directory of Icelandic startups with filtering by sector and status.
 * Version: 1.2.0
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
                '1.2.0'
            );

            // Startup data
            wp_enqueue_script(
                'startup-directory-data',
                plugin_dir_url(__FILE__) . 'js/startups-data.js',
                array(),
                '1.2.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'startup-directory-js',
                plugin_dir_url(__FILE__) . 'js/directory.js',
                array('startup-directory-data'),
                '1.2.0',
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
            <!-- Hero: counts are filled in by JS from the startup data -->
            <header class="sid-hero">
                <p class="sid-hero-eyebrow">Startup Iceland · Directory</p>
                <h1 class="sid-hero-title">Iceland’s startup directory</h1>
                <p class="sid-hero-lead">Iceland has produced a remarkable number of technology companies for a nation of about 400,000, from CCP Games to Meniga. This directory covers them all, from early-stage ventures to established companies and those that have been acquired.</p>
                <?php if ($show_stats): ?>
                <div class="sid-hero-stats">
                    <div class="sid-hero-stat"><span class="sid-hero-value" id="sid-stat-total">–</span><span class="sid-hero-label">startups listed</span></div>
                    <div class="sid-hero-stat"><span class="sid-hero-value" id="sid-stat-active">–</span><span class="sid-hero-label">active today</span></div>
                    <div class="sid-hero-stat"><span class="sid-hero-value is-accent" id="sid-stat-acquired">–</span><span class="sid-hero-label">acquired</span></div>
                </div>
                <?php endif; ?>
                <a class="sid-hero-link" href="/jobs/">Find jobs at Icelandic startups
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </header>

            <!-- Search and filters -->
            <section class="sid-controls" aria-label="Search and filter startups">
                <label class="sid-search-wrapper" for="sid-search">
                    <span class="sid-search-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
                    <span class="screen-reader-text">Search startups</span>
                    <input type="search" id="sid-search" placeholder="Search by name or keyword" />
                </label>
                <div class="sid-filter-row">
                    <label class="sid-filter-wrapper" for="sid-sector-filter">Sector
                        <select id="sid-sector-filter">
                            <option value="all">All sectors</option>
                            <!-- Populated by JS -->
                        </select>
                    </label>
                    <label class="sid-filter-wrapper" for="sid-status-filter">Status
                        <select id="sid-status-filter">
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="acquired">Acquired</option>
                            <option value="exited">Exited</option>
                        </select>
                    </label>
                </div>
            </section>

            <!-- Count bar and sort -->
            <div class="sid-count-bar">
                <span>Showing <strong id="sid-showing-count">0</strong> startups</span>
                <label class="sid-sort-wrapper" for="sid-sort">Sort
                    <select id="sid-sort">
                        <option value="name-asc">Name A–Z</option>
                        <option value="name-desc">Name Z–A</option>
                        <option value="year-desc">Newest first</option>
                        <option value="year-asc">Oldest first</option>
                    </select>
                </label>
            </div>

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

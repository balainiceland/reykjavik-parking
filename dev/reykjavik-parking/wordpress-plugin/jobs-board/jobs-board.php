<?php
/**
 * Plugin Name: Startup Iceland Jobs Board
 * Plugin URI: https://startupiceland.com
 * Description: Searchable jobs board for Icelandic startups with filtering by category, type, level, and remote options.
 * Version: 1.1.0
 * Author: Startup Iceland
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Startup_Iceland_Jobs_Board {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('startup_jobs', array($this, 'render_jobs_board'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function enqueue_scripts() {
        global $post;

        // Only load on pages with our shortcode
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'startup_jobs')) {
            // Plugin CSS
            wp_enqueue_style(
                'startup-jobs-css',
                plugin_dir_url(__FILE__) . 'css/jobs-board.css',
                array(),
                '1.1.0'
            );

            // Jobs data
            wp_enqueue_script(
                'startup-jobs-data',
                plugin_dir_url(__FILE__) . 'js/jobs-data.js',
                array(),
                '1.1.0',
                true
            );

            // Plugin JS
            wp_enqueue_script(
                'startup-jobs-js',
                plugin_dir_url(__FILE__) . 'js/jobs-board.js',
                array('startup-jobs-data'),
                '1.1.0',
                true
            );
        }
    }

    public function render_jobs_board($atts) {
        $atts = shortcode_atts(array(
            'show_count' => 'true'
        ), $atts);

        $show_count = filter_var($atts['show_count'], FILTER_VALIDATE_BOOLEAN);

        ob_start();
        ?>
        <div class="sjb-container" id="sjb-container">
            <!-- Search -->
            <div class="sjb-controls">
                <div class="sjb-search-row">
                    <div class="sjb-search-wrapper">
                        <input type="text" id="sjb-search" placeholder="Search jobs by title, company, or keywords..." />
                    </div>
                </div>

                <!-- Filters -->
                <div class="sjb-filter-row">
                    <div class="sjb-filter-wrapper">
                        <label for="sjb-category-filter">Category:</label>
                        <select id="sjb-category-filter">
                            <option value="all">All Categories</option>
                            <!-- Populated by JS -->
                        </select>
                    </div>
                    <div class="sjb-filter-wrapper">
                        <label for="sjb-type-filter">Type:</label>
                        <select id="sjb-type-filter">
                            <option value="all">All Types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>
                    <div class="sjb-filter-wrapper">
                        <label for="sjb-level-filter">Level:</label>
                        <select id="sjb-level-filter">
                            <option value="all">All Levels</option>
                            <option value="entry">Entry</option>
                            <option value="mid">Mid</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead</option>
                            <option value="executive">Executive</option>
                        </select>
                    </div>
                    <div class="sjb-filter-wrapper">
                        <label for="sjb-remote-filter">Remote:</label>
                        <select id="sjb-remote-filter">
                            <option value="all">All Options</option>
                            <option value="onsite">Onsite</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>
                    <div class="sjb-filter-wrapper sjb-sort-wrapper">
                        <label for="sjb-sort">Sort by:</label>
                        <select id="sjb-sort">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="company-az">Company A-Z</option>
                            <option value="company-za">Company Z-A</option>
                        </select>
                    </div>
                </div>
            </div>

            <?php if ($show_count): ?>
            <!-- Count Bar -->
            <div class="sjb-count-bar">
                <span>Showing <strong id="sjb-showing-count">0</strong> jobs from <strong id="sjb-company-count">0</strong> companies</span>
            </div>
            <?php endif; ?>

            <!-- Jobs List -->
            <div class="sjb-jobs-list" id="sjb-jobs-list">
                <!-- Populated by JS -->
            </div>

            <!-- No Jobs Message -->
            <div class="sjb-no-jobs" id="sjb-no-jobs" style="display: none;">
                <p>No jobs match your search criteria. Try adjusting your filters.</p>
            </div>

            <!-- Call to Action -->
            <div class="sjb-cta-box">
                <div class="sjb-cta-content">
                    <h3>Hiring at your startup?</h3>
                    <p>If you're an Icelandic startup looking to hire great talent, we'd love to feature your open positions. Send us your job posting and we'll add it to the board.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Job%20Board%20Submission&body=Hi%20Bala%2C%0A%0AI'd%20like%20to%20post%20a%20job%20on%20the%20Startup%20Iceland%20Jobs%20Board%3A%0A%0ACompany%20Name%3A%20%0AJob%20Title%3A%20%0AJob%20Description%3A%20%0ACategory%3A%20(Engineering%2FDesign%2FMarketing%2FSales%2FOperations%2FProduct%2FFinance%2FOther)%0AType%3A%20(Full-time%2FPart-time%2FContract%2FInternship)%0AExperience%20Level%3A%20(Entry%2FMid%2FSenior%2FLead%2FExecutive)%0ALocation%3A%20%0ARemote%20Option%3A%20(Onsite%2FHybrid%2FRemote)%0ASalary%20(optional)%3A%20%0AApplication%20URL%3A%20%0A%0AThanks!" class="sjb-cta-button">Post a Job</a>
                    <p class="sjb-cta-note">Job postings are free for Icelandic startups.</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Startup_Iceland_Jobs_Board::get_instance();

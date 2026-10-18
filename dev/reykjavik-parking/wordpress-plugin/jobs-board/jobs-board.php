<?php
/**
 * Plugin Name: Startup Iceland Jobs Board
 * Plugin URI: https://startupiceland.com
 * Description: Searchable jobs board for Icelandic startups with filtering by category, type, level, and remote options.
 * Version: 1.5.0
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
        add_shortcode('iceland_work_trends', array($this, 'render_work_trends'));
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
                '1.5.0'
            );

            // Plugin JS — fetches jobs data from jsDelivr CDN at runtime
            wp_enqueue_script(
                'startup-jobs-js',
                plugin_dir_url(__FILE__) . 'js/jobs-board.js',
                array(),
                '1.5.0',
                true
            );
        }

        // Iceland's changing world of work: figures published daily by the
        // jobs research database (github.com/balainiceland/iceland-work-trends)
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'iceland_work_trends')) {
            wp_enqueue_style(
                'startup-jobs-css',
                plugin_dir_url(__FILE__) . 'css/jobs-board.css',
                array(),
                '1.4.0'
            );
            wp_enqueue_script(
                'iceland-work-trends-js',
                plugin_dir_url(__FILE__) . 'js/work-trends.js',
                array(),
                '1.4.0',
                true
            );
        }
    }

    public function render_work_trends($atts) {
        return '<div class="siwt-container" id="siwt-container"><p class="siwt-loading">Loading the latest figures…</p></div>';
    }

    public function render_jobs_board($atts) {
        $atts = shortcode_atts(array(
            'show_count' => 'true',
            'trends'     => 'true'
        ), $atts);

        $show_count = filter_var($atts['show_count'], FILTER_VALIDATE_BOOLEAN);
        $show_trends = filter_var($atts['trends'], FILTER_VALIDATE_BOOLEAN);

        ob_start();
        ?>
        <div class="sjb-container" id="sjb-container">
            <!-- Hero: counts are filled in by JS from the jobs data -->
            <header class="sjb-hero">
                <p class="sjb-hero-eyebrow">Startup Iceland · Jobs</p>
                <h1 class="sjb-hero-title">Startup jobs in Iceland</h1>
                <p class="sjb-hero-lead">Open roles at Icelandic startups and growing companies, collected every morning from Alfreð, Tvinna and company career pages.</p>
                <div class="sjb-hero-stats">
                    <div class="sjb-hero-stat"><span class="sjb-hero-value" id="sjb-hero-open">–</span><span class="sjb-hero-label">open jobs</span></div>
                    <div class="sjb-hero-stat"><span class="sjb-hero-value" id="sjb-hero-companies">–</span><span class="sjb-hero-label">companies hiring</span></div>
                    <div class="sjb-hero-stat"><span class="sjb-hero-value is-accent" id="sjb-hero-startups">–</span><span class="sjb-hero-label">at Icelandic startups</span></div>
                </div>
                <a class="sjb-hero-link" href="https://startupiceland.com/changing-world-of-work/">See how AI is changing Iceland’s job market
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
            </header>

            <!-- Search and filters -->
            <section class="sjb-controls" aria-label="Search and filter jobs">
                <label class="sjb-search-wrapper" for="sjb-search">
                    <span class="sjb-search-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
                    <span class="screen-reader-text">Search jobs</span>
                    <input type="search" id="sjb-search" placeholder="Search jobs by title, company or keyword" />
                </label>
                <div class="sjb-filter-row">
                    <label class="sjb-filter-wrapper" for="sjb-category-filter">Category
                        <select id="sjb-category-filter">
                            <option value="all">All categories</option>
                            <!-- Populated by JS -->
                        </select>
                    </label>
                    <label class="sjb-filter-wrapper" for="sjb-employer-filter">Employer
                        <select id="sjb-employer-filter">
                            <option value="all">All employers</option>
                            <option value="startups">Startups only</option>
                        </select>
                    </label>
                    <label class="sjb-filter-wrapper" for="sjb-type-filter">Type
                        <select id="sjb-type-filter">
                            <option value="all">All types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                        </select>
                    </label>
                    <label class="sjb-filter-wrapper" for="sjb-level-filter">Level
                        <select id="sjb-level-filter">
                            <option value="all">All levels</option>
                            <option value="entry">Entry</option>
                            <option value="mid">Mid</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead</option>
                            <option value="executive">Executive</option>
                        </select>
                    </label>
                    <label class="sjb-filter-wrapper" for="sjb-remote-filter">Workplace
                        <select id="sjb-remote-filter">
                            <option value="all">All options</option>
                            <option value="onsite">On-site</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="remote">Remote</option>
                        </select>
                    </label>
                </div>
            </section>

            <?php if ($show_trends): ?>
            <!-- Hiring trends: drawn by JS from the same jobs data as the list -->
            <details class="sjb-trends" id="sjb-trends" open>
                <summary>Hiring trends</summary>
                <p class="sjb-trends-lead" id="sjb-trends-lead"></p>
                <div class="sjb-trends-controls">
                    <div class="sjb-seg" role="group" aria-label="Measure">
                        <button type="button" data-trend="measure" data-value="postings" aria-pressed="true">Job postings</button>
                        <button type="button" data-trend="measure" data-value="companies" aria-pressed="false">Companies hiring</button>
                    </div>
                    <div class="sjb-seg" role="group" aria-label="Employers">
                        <button type="button" data-trend="employers" data-value="all" aria-pressed="true">All employers</button>
                        <button type="button" data-trend="employers" data-value="startups" aria-pressed="false">Startups</button>
                    </div>
                    <div class="sjb-seg" role="group" aria-label="Status">
                        <button type="button" data-trend="status" data-value="all" aria-pressed="true">All postings</button>
                        <button type="button" data-trend="status" data-value="open" aria-pressed="false">Open now</button>
                    </div>
                </div>
                <div class="sjb-trends-scroll">
                    <div class="sjb-trends-grid" id="sjb-trends-grid" role="group" aria-label="Job postings by category and month"></div>
                </div>
                <button type="button" class="sjb-trends-more" id="sjb-trends-more" hidden></button>
                <p class="sjb-trends-note">By the month a job was first posted. Tracking began in January 2026, so January includes jobs that were already open. Select a category to show its jobs below.</p>
            </details>
            <?php endif; ?>

            <?php if ($show_count): ?>
            <!-- Count Bar -->
            <div class="sjb-count-bar">
                <span>Showing <strong id="sjb-showing-count">0</strong> jobs from <strong id="sjb-company-count">0</strong> companies<span id="sjb-startup-note"></span></span>
                <label class="sjb-sort-wrapper" for="sjb-sort">Sort
                    <select id="sjb-sort">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="company-az">Company A–Z</option>
                        <option value="company-za">Company Z–A</option>
                    </select>
                </label>
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
                    <h3>Hiring at an Icelandic startup?</h3>
                    <p>Post your job here, free for Icelandic startups. It also feeds our research on how Iceland’s world of work is changing.</p>
                    <a href="mailto:bala@startupiceland.com?subject=Job%20Board%20Submission&body=Hi%20Bala%2C%0A%0AI'd%20like%20to%20post%20a%20job%20on%20the%20Startup%20Iceland%20Jobs%20Board%3A%0A%0ACompany%20Name%3A%20%0AJob%20Title%3A%20%0AJob%20Description%3A%20%0ACategory%3A%20(Engineering%2FDesign%2FMarketing%2FSales%2FOperations%2FProduct%2FFinance%2FOther)%0AType%3A%20(Full-time%2FPart-time%2FContract%2FInternship)%0AExperience%20Level%3A%20(Entry%2FMid%2FSenior%2FLead%2FExecutive)%0ALocation%3A%20%0ARemote%20Option%3A%20(Onsite%2FHybrid%2FRemote)%0ASalary%20(optional)%3A%20%0AApplication%20URL%3A%20%0A%0AThanks!" class="sjb-cta-button">Post a Job</a>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
Startup_Iceland_Jobs_Board::get_instance();

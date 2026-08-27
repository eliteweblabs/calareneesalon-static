#!/usr/bin/env node
/**
 * Post-process mirrored luxemeds.com homepage for static hosting.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'public', 'index.html');
let html = readFileSync(indexPath, 'utf8');

html = html.replace(/<title><\/title>/, '<title>Cala Renee Salon</title>');
html = html.replace(
  /<meta name='robots' content='max-image-preview:large' \/>/,
  "<meta name='robots' content='max-image-preview:large' />\n<meta name='description' content='Cala Renee Salon in Beverly, MA — curly hair specialists since 1989. Curl-by-curl cuts, color, and Innersense organic beauty.' />",
);

// Drop age verification (LuxeMeds WordPress plugin — not needed for salon site).
html = html.replace(/\n<style id='age-gate-custom-inline-css'>[\s\S]*?\/style>/g, '');
html = html.replace(/\n<link rel='stylesheet' id='age-gate-css'[^>]*>/g, '');
html = html.replace(/\n<style id='age-gate-options-inline-css'>[\s\S]*?\/style>/g, '');
html = html.replace(/\n<template id="tmpl-age-gate"[\s\S]*?<\/template>/g, '');
html = html.replace(/\n<script id="age-gate-all-js-extra">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n<script src="wp-content\/plugins\/age-gate\/dist\/all\.js[^>]*><\/script>/g, '');
html = html.replace(/\n<script id="age-gate-js-extra">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n<script src="wp-content\/plugins\/age-gate\/dist\/age-gate\.js[^>]*><\/script>/g, '');
rmSync(join(root, 'public', 'wp-content', 'plugins', 'age-gate'), { recursive: true, force: true });

// Drop WordPress-only head tags that 404 on static hosting.
html = html.replace(/\n<link rel="alternate" type="application\/rss\+xml"[^>]*>/g, '');
html = html.replace(/\n<link rel="alternate" title="oEmbed[^>]*>/g, '');
html = html.replace(/\n<link rel="https:\/\/api\.w\.org\/"[^>]*>/g, '');
html = html.replace(/\n<link rel="alternate" title="JSON"[^>]*>/g, '');
html = html.replace(/\n<link rel="EditURI"[^>]*>/g, '');
html = html.replace(/\n<script src="https:\/\/luxemeds\.com\/wp-content\/plugins\/woocommerce[^>]*><\/script>/g, '');

// Point off-site page links to placeholders until salon pages exist.
html = html.replace(/https:\/\/luxemeds\.com\/[^"'#\s]*/g, '#');

// Rebrand visible copy for the salon launch.
html = html.replace(/Transform Your Health <br>Guided Wellness Care/g, 'Elevate Your Look <br>Salon &amp; Beauty Care');
html = html.replace(/Browse Products/g, 'Book Appointment');
html = html.replace(/Featured Products/g, 'Featured Services');
html = html.replace(/How It Works/g, 'Our Process');
html = html.replace(/A Short Questionnaire/g, 'Consultation');
html = html.replace(/Medical Review/g, 'Style Plan');
html = html.replace(/Approved Plan/g, 'Your Visit');
html = html.replace(/Shipped to You/g, 'Walk Out Glowing');
html = html.replace(/LuxeMeds/g, 'Cala Renee Salon');
html = html.replace(/Medically Supervised Wellness Delivered\.\.\./g, 'Salon services tailored to you.');
html = html.replace(
  /Provider-guided support for weight loss, peptide therapy, hormone optimization, and longevity\./g,
  'Expert cuts, color, styling, and beauty treatments in a welcoming salon experience.',
);

writeFileSync(indexPath, html);
console.log('Cleaned public/index.html');

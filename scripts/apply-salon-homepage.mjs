#!/usr/bin/env node
/**
 * Replace leftover LuxeMeds copy/images with Cala Renee Salon content.
 * Keeps cart, search, and live-chat chrome from the template.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'public', 'index.html');
let html = readFileSync(indexPath, 'utf8');

const logoImg =
  '<img width="80" height="80" src="cr-monogram.svg" class="custom-logo" alt="Cala Renee Salon" decoding="async" />';

html = html.replace(
  /<img[^>]*src="wp-content\/uploads\/2025\/07\/cropped-cropped-3-1\.png"[^>]*>/g,
  logoImg,
);

html = html.replace(
  'href="wp-content/uploads/2025/07/cropped-cropped-3-1.png" as="image"',
  'href="cr-monogram.svg" as="image"',
);

if (!html.includes('id=\'cala-salon-css\'')) {
  html = html.replace(
    "<link rel='stylesheet' id='luxemeds-quickstart-css'",
    "<link rel='stylesheet' id='cala-salon-css' href='cala-salon.css' media='all' />\n<link rel='stylesheet' id='luxemeds-quickstart-css'",
  );
}

html = html.replace(
  "content='Cala Renee Salon — beauty and wellness services.'",
  "content='Cala Renee Salon in Beverly, MA — curly hair specialists since 1989. Curl-by-curl cuts, color, and Innersense organic beauty.'",
);

const navItems = `<li id="menu-item-1965" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-home current-menu-item page_item page-item-65 current_page_item menu-item-1965 emoza-dropdown-li"><a href="index.html" aria-current="page" class="emoza-dropdown-link">Home</a></li>
<li id="menu-item-1969" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-1969 emoza-dropdown-li"><a href="#services" class="emoza-dropdown-link">Services</a></li>
<li id="menu-item-1966" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-1966 emoza-dropdown-li"><a href="#about" class="emoza-dropdown-link">About</a></li>
<li id="menu-item-2744" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-2744 emoza-dropdown-li"><a href="#shop" class="emoza-dropdown-link">Shop</a></li>
<li id="menu-item-2713" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-2713 emoza-dropdown-li"><a href="#contact" class="emoza-dropdown-link">Contact</a></li>`;

html = html.replace(
  /<ul id="primary-menu" class="emoza-dropdown-ul menu">[\s\S]*?<\/ul>/g,
  `<ul id="primary-menu" class="emoza-dropdown-ul menu">${navItems}</ul>`,
);

html = html.replace(/Search products&hellip;/g, 'Search services&hellip;');
html = html.replace(/title="Search for the product"/g, 'title="Search services"');

html = html.replace(
  /https:\/\/www\.facebook\.com\/people\/getluxemeds\/61585135993851\//g,
  'https://www.facebook.com/calareneesalon/',
);
html = html.replace(
  /https:\/\/www\.instagram\.com\/getluxemeds\//g,
  'https://www.instagram.com/calareneesalon/',
);

html = html.replace(
  /url\('wp-content\/uploads\/2026\/03\/layered-hero\/luxe-hero-mobile-panorama\.png'\)/g,
  "url('salon/hero-salon.jpg')",
);

const heroSlides = [
  ['salon/hero-curls.jpg', 'Curl by Curl Cut', 'Book Now'],
  ['salon/hero-cut.jpg', 'Dry sculpting', 'Book Now'],
  ['salon/hero-wash.jpg', 'Botanical cleanse', 'Book Now'],
  ['salon/hero-style.jpg', 'Style &amp; coaching', 'Book Now'],
  ['salon/process-glow.jpg', 'Walk out glowing', 'Book Now'],
];

let slideIndex = 0;
html = html.replace(
  /<div class="swiper-slide" data-hero-index="\d+">[\s\S]*?<\/div>\s*<\/div>/g,
  (block) => {
    const slide = heroSlides[slideIndex];
    if (!slide) return block;
    slideIndex += 1;
    const [src, label, cta] = slide;
    return block
      .replace(/src="wp-content\/uploads\/2026\/03\/layered-hero\/hero-bottle-[^"]+"/g, `src="${src}"`)
      .replace(/<div class="screen-reader-text">[\s\S]*?<\/div>/, `<div class="screen-reader-text">${label}</div>`)
      .replace(/>\s*Get Approved\s*</g, `>${cta}<`)
      .replace(
        /href="#" class="luxe-hero-btn luxe-hero-btn-cart/g,
        'href="tel:9789277500" class="luxe-hero-btn luxe-hero-btn-cart',
      );
  },
);

const mainContent = `<section class="luxemeds-hero luxemeds-section">
			<p class="luxemeds-kicker">Changing lives one curl at a time.</p>
			<h1>Welcome to <br>Cala Renee Salon</h1>
			<p>
				Curl specialists in Beverly, Massachusetts since 1989. We sculpt hair curl-by-curl, in its natural state, then send you home knowing how to love it.
			</p>
			<div class="luxemeds-actions luxemeds-actions--centered">
				<a class="luxemeds-btn luxemeds-btn--large" href="tel:9789277500">Book Appointment</a>
			</div>
		</section>

	
		<section class="luxemeds-section" id="services">
			<h2><i>Our Process</i> >>></h2>
			<div class="luxemeds-grid luxemeds-grid-4">
				<article class="luxemeds-card">
					<div class="luxemeds-card__image"><img decoding="async" src="salon/process-consult.jpg" alt="Consultation" loading="lazy" /></div>
					<h3>1. Consultation</h3><p>We talk lifestyle, texture, and what you want your curls to do.</p>
				</article>
				<article class="luxemeds-card">
					<div class="luxemeds-card__image"><img decoding="async" src="salon/process-cut.jpg" alt="Curl by curl cut" loading="lazy" /></div>
					<h3>2. Curl by Curl Cut</h3><p>Hair is sculpted dry, curl by curl, so the shape lives in your natural pattern.</p>
				</article>
				<article class="luxemeds-card">
					<div class="luxemeds-card__image"><img decoding="async" src="salon/process-style.jpg" alt="Style and coaching" loading="lazy" /></div>
					<h3>3. Style &amp; Coach</h3><p>Botanical cleanse, style, and a product prescription you can repeat at home.</p>
				</article>
				<article class="luxemeds-card">
					<div class="luxemeds-card__image"><img decoding="async" src="salon/process-glow.jpg" alt="Walk out glowing" loading="lazy" /></div>
					<h3>4. Walk Out Glowing</h3><p>Leave with definition, bounce, and a plan for your next wash day.</p>
				</article>
			</div>
		</section>

		<section class="luxemeds-section" id="about">
			<h2><i>Our Vision</i> >>></h2>
			<p>Serving Beverly since 1989. For more than three decades, we have welcomed generations of guests through our doors. Beautiful hair begins with understanding, care, and celebrating what makes each person unique.</p>
			<p>We specialize in curls of every type and texture. Every stylist is trained in Deva and Lorraine Massey’s curl-by-curl cutting, and trained by Cala herself. From your first visit to your hundredth, the goal is the same: you feel seen, valued, and confident in your hair.</p>
			<p>Celebrating your curls. Celebrating you.<br />— Cala Renee &amp; Staff</p>
		</section>

		<section class="luxemeds-testimonials" aria-label="Guest testimonials">
			<div class="luxemeds-testimonials-carousel" data-interval="6000">
				<div class="luxemeds-testimonial-slide is-active" style="--bg-image: url('salon/testimonial-1.jpg')">
					<div class="luxemeds-testimonial-bg" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-overlay" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-content">
						<blockquote class="luxemeds-testimonial-quote">"I look forward to my hour at Cala Renee every five weeks. The cut and styling are superb, and the wash is a gift."</blockquote>
						<cite class="luxemeds-testimonial-author">— Guest, Beverly</cite>
					</div>
				</div>
				<div class="luxemeds-testimonial-slide" style="--bg-image: url('salon/testimonial-2.jpg')">
					<div class="luxemeds-testimonial-bg" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-overlay" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-content">
						<blockquote class="luxemeds-testimonial-quote">"They finally taught me how to wear my own curls. I stopped fighting my hair."</blockquote>
						<cite class="luxemeds-testimonial-author">— Guest, North Shore</cite>
					</div>
				</div>
				<div class="luxemeds-testimonial-slide" style="--bg-image: url('salon/testimonial-3.jpg')">
					<div class="luxemeds-testimonial-bg" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-overlay" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-content">
						<blockquote class="luxemeds-testimonial-quote">"Three decades of curl care, and it still feels personal every visit."</blockquote>
						<cite class="luxemeds-testimonial-author">— Guest, Salem</cite>
					</div>
				</div>
				<div class="luxemeds-testimonial-slide" style="--bg-image: url('salon/testimonial-4.jpg')">
					<div class="luxemeds-testimonial-bg" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-overlay" aria-hidden="true"></div>
					<div class="luxemeds-testimonial-content">
						<blockquote class="luxemeds-testimonial-quote">"The dry cut changed everything. My curls actually have a shape now."</blockquote>
						<cite class="luxemeds-testimonial-author">— Guest, Manchester</cite>
					</div>
				</div>
			</div>
		</section>

		<section class="luxemeds-section" id="shop">
			<h2><i>Featured Services</i> >>></h2>
			<div class="woocommerce columns-4 product-grid"><ul class="products columns-4">
<li class="product type-product post-4076 status-publish first instock product_cat-services shipping-taxable purchasable product-type-simple">
	<a href="#services" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"><div class="loop-image-wrap emoza-add-to-cart-button-layout3"><img decoding="async" width="420" height="420" src="salon/service-cut.jpg" class="wp-post-image" alt="Curl by Curl Cut" /><div class="loop-button-wrap button-layout3 button-width-auto"><a title="Add to cart: Curl by Curl Cut" href="#" data-quantity="1" class="button product_type_simple add_to_cart_button" data-product_id="4076" aria-label="Add Curl by Curl Cut to cart" rel="nofollow">Add to cart</a></div></div></a><h2 class="woocommerce-loop-product__title"><a class="emoza-wc-loop-product__title" href="#services">Curl by Curl Cut</a></h2>
	<span class="price"><span class="woocommerce-Price-amount amount"><bdi>Call to book</bdi></span></span>
</li>
<li class="product type-product post-2425 status-publish instock product_cat-services has-post-thumbnail shipping-taxable purchasable product-type-simple">
	<a href="#services" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"><div class="loop-image-wrap emoza-add-to-cart-button-layout3"><img decoding="async" width="420" height="420" src="salon/service-color.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="First Visit Bundle" /><div class="loop-button-wrap button-layout3 button-width-auto"><a title="Add to cart: First Visit Bundle" href="#" data-quantity="1" class="button product_type_simple add_to_cart_button" data-product_id="2425" aria-label="Add First Visit Bundle to cart" rel="nofollow">Add to cart</a></div></div></a><h2 class="woocommerce-loop-product__title"><a class="emoza-wc-loop-product__title" href="#services">First Visit Bundle</a></h2>
	<span class="price"><span class="woocommerce-Price-amount amount"><bdi>Cut, treat &amp; coach</bdi></span></span>
</li>
<li class="product type-product post-2416 status-publish instock product_cat-services has-post-thumbnail shipping-taxable purchasable product-type-simple">
	<a href="#services" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"><div class="loop-image-wrap emoza-add-to-cart-button-layout3"><img decoding="async" width="420" height="420" src="salon/service-bootcamp.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="Botanical color" /><div class="loop-button-wrap button-layout3 button-width-auto"><a title="Add to cart: Botanical Color" href="#" data-quantity="1" class="button product_type_simple add_to_cart_button" data-product_id="2416" aria-label="Add Botanical Color to cart" rel="nofollow">Add to cart</a></div></div></a><h2 class="woocommerce-loop-product__title"><a class="emoza-wc-loop-product__title" href="#services">Botanical Color</a></h2>
	<span class="price"><span class="woocommerce-Price-amount amount"><bdi>Pintura &amp; gloss</bdi></span></span>
</li>
<li class="product type-product post-2415 status-publish last instock product_cat-retail has-post-thumbnail shipping-taxable purchasable product-type-simple">
	<a href="#shop" class="woocommerce-LoopProduct-link woocommerce-loop-product__link"><div class="loop-image-wrap emoza-add-to-cart-button-layout3"><img decoding="async" width="420" height="420" src="salon/service-shop.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="Innersense organic beauty" /><div class="loop-button-wrap button-layout3 button-width-auto"><a title="Add to cart: Innersense Retail" href="#" data-quantity="1" class="button product_type_simple add_to_cart_button" data-product_id="2415" aria-label="Add Innersense retail to cart" rel="nofollow">Add to cart</a></div></div></a><h2 class="woocommerce-loop-product__title"><a class="emoza-wc-loop-product__title" href="#shop">Innersense Organic Beauty</a></h2>
	<span class="price"><span class="woocommerce-Price-amount amount"><bdi>Take home care</bdi></span></span>
</li>
</ul>
</div>
		</section>

		<section class="luxemeds-section" id="contact">
			<h2><i>Visit Us</i> >>></h2>
			<p>309 Rantoul Street<br />Beverly, MA 01915</p>
			<div class="luxemeds-contact-meta">
				<a href="tel:9789277500">978-927-7500</a>
				<a href="mailto:calarenee@calareneesalon.com">calarenee@calareneesalon.com</a>
			</div>
			<div class="luxemeds-hours" aria-label="Salon hours">
				<div><span>Tuesday</span><span>8:00–4:00</span></div>
				<div><span>Wednesday</span><span>9:00–7:00</span></div>
				<div><span>Thursday</span><span>8:00–7:00</span></div>
				<div><span>Friday</span><span>8:00–5:00</span></div>
				<div><span>Saturday</span><span>8:00–3:00</span></div>
			</div>
			<p>We ask for 48 hours’ notice so we can offer your time to another guest. Same-day or no-show cancellations may be charged.</p>
			<div class="luxemeds-actions luxemeds-actions--centered">
				<a class="luxemeds-btn luxemeds-btn--large" href="tel:9789277500">Call to Book</a>
			</div>
		</section>`;

html = html.replace(
  /<p><code class="">[\s\S]*?<\/code><\/p>/,
  mainContent,
);

html = html.replace(
  /<nav class="luxemeds-footer__links" aria-label="Footer navigation">[\s\S]*?<\/nav>/,
  `<nav class="luxemeds-footer__links" aria-label="Footer navigation">
											<a href="#shop">Shop</a> <span class="luxemeds-footer__sep" aria-hidden="true">|</span> 											<a href="#services">Services</a> <span class="luxemeds-footer__sep" aria-hidden="true">|</span> 											<a href="#about">About</a> <span class="luxemeds-footer__sep" aria-hidden="true">|</span> 											<a href="#contact">Contact</a>									</nav>`,
);

html = html.replace(
  /&copy; 2026 \. All rights reserved\./,
  '&copy; 2026 Cala Renee Salon. All rights reserved.',
);
html = html.replace(
  /&copy; 2026 \. Proudly powered by/,
  '&copy; 2026 Cala Renee Salon. Proudly powered by',
);

html = html.replace('alt="Luxe Concierge online"', 'alt="Cala Renee salon concierge"');
html = html.replace(
  'placeholder="How can I help you?"',
  'placeholder="Ask about cuts, color, or booking"',
);

writeFileSync(indexPath, html);
console.log('Applied salon homepage content');


"use strict";

/* =========================================================
   OASIS BREEZE — WEBSITE JAVASCRIPT
   File: script.js
   Framework: Vanilla JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    /* =====================================================
       1. SHARED ELEMENTS AND SETTINGS
       ===================================================== */

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const WHATSAPP_NUMBER = "966595851191";

    const CONTACT_SECTION_ID = "contact";

    const getElement = (selector) => document.querySelector(selector);

    const getElements = (selector) =>
        Array.from(document.querySelectorAll(selector));


    /* =====================================================
       2. MOBILE NAVIGATION
       ===================================================== */

    const menuToggle = getElement("#menu-toggle");
    const primaryNavigation = getElement("#primary-navigation");

    if (menuToggle && primaryNavigation) {
        const navigationLinks = getElements(
            "#primary-navigation a[href]"
        );

        const isMenuOpen = () =>
            menuToggle.getAttribute("aria-expanded") === "true";

        const openMenu = () => {
            primaryNavigation.classList.add("active");

            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );
        };

        const closeMenu = ({ returnFocus = false } = {}) => {
            primaryNavigation.classList.remove("active");
            primaryNavigation.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

            if (returnFocus) {
                menuToggle.focus();
            }
        };

        menuToggle.addEventListener("click", () => {
            if (isMenuOpen()) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        /*
         * Close the menu after a navigation link is selected.
         * Desktop navigation remains available as usual.
         */
        navigationLinks.forEach((link) => {
            link.addEventListener("click", () => {
                closeMenu();
            });
        });

        /*
         * Close on Escape and return keyboard focus to the toggle.
         */
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isMenuOpen()) {
                closeMenu({ returnFocus: true });
            }
        });

        /*
         * Close an open mobile menu when the visitor clicks outside it.
         */
        document.addEventListener("click", (event) => {
            if (!isMenuOpen()) {
                return;
            }

            const clickedInsideNavigation =
                primaryNavigation.contains(event.target);

            const clickedToggle =
                menuToggle.contains(event.target);

            if (!clickedInsideNavigation && !clickedToggle) {
                closeMenu();
            }
        });

        /*
         * If the layout returns to desktop navigation, reset the
         * mobile menu state.
         */
        const desktopMediaQuery = window.matchMedia(
            "(min-width: 901px)"
        );

        const handleDesktopLayout = (event) => {
            if (event.matches) {
                closeMenu();
            }
        };

        if (typeof desktopMediaQuery.addEventListener === "function") {
            desktopMediaQuery.addEventListener(
                "change",
                handleDesktopLayout
            );
        } else {
            /* Compatibility with older browsers. */
            desktopMediaQuery.addListener(handleDesktopLayout);
        }
    }


    /* =====================================================
       3. SMOOTH SCROLLING
       ===================================================== */

    const getScrollTarget = (hash) => {
        if (!hash || hash === "#") {
            return null;
        }

        try {
            return document.getElementById(
                decodeURIComponent(hash.slice(1))
            );
        } catch {
            return null;
        }
    };

    const scrollToTarget = (target) => {
        if (!target) {
            return;
        }

        target.scrollIntoView({
            behavior: prefersReducedMotion.matches ? "auto" : "smooth",
            block: "start"
        });
    };

    /*
     * Handle same-page navigation links. Links without a valid
     * target are left untouched.
     */
    getElements('a[href*="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                link.hasAttribute("download") ||
                (
                    link.target &&
                    link.target.toLowerCase() !== "_self"
                )
            ) {
                return;
            }

            let destination;

            try {
                destination = new URL(
                    link.href,
                    window.location.href
                );
            } catch {
                return;
            }

            /*
             * Only intercept same-page hash links. Links to another
             * page or another website should use normal browser behavior.
             */
            if (
                destination.origin !== window.location.origin ||
                destination.pathname !== window.location.pathname ||
                destination.search !== window.location.search ||
                !destination.hash
            ) {
                return;
            }

            const target = getScrollTarget(destination.hash);

            if (!target) {
                return;
            }

            event.preventDefault();

            scrollToTarget(target);

            /*
             * Keep the URL hash synchronized without triggering
             * an additional native jump.
             */
            if (window.location.hash !== destination.hash) {
                window.history.pushState(
                    null,
                    "",
                    destination.hash
                );
            }
        });
    });

    /*
     * Support browser back/forward navigation when the URL hash changes.
     */
    window.addEventListener("popstate", () => {
        const target = getScrollTarget(window.location.hash);

        if (target) {
            scrollToTarget(target);
        }
    });


    /* =====================================================
       4. PROJECT GALLERY FILTERS
       ===================================================== */

    const filterButtons = getElements(".filter-btn");
    const projectCards = getElements(".project-card");

    if (filterButtons.length > 0 && projectCards.length > 0) {
        const validCategories = new Set([
            "all",
            "commercial",
            "residential",
            "ductwork"
        ]);

        const getProjectCategory = (card) => {
            const dataCategory = card.dataset.category;

            if (dataCategory) {
                return dataCategory.toLowerCase();
            }

            /*
             * Fall back to the category classes in the existing HTML.
             */
            const categoryClasses = [
                "commercial",
                "residential",
                "ductwork"
            ];

            return categoryClasses.find((category) =>
                card.classList.contains(`project-${category}`)
            ) || "";
        };

        const filterProjects = (selectedCategory) => {
            const category = validCategories.has(selectedCategory)
                ? selectedCategory
                : "all";

            filterButtons.forEach((button) => {
                const isActive =
                    button.dataset.filter === category;

                button.classList.toggle("active", isActive);
                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            });

            projectCards.forEach((card) => {
                const cardCategory = getProjectCategory(card);

                const shouldShow =
                    category === "all" ||
                    cardCategory === category;

                card.hidden = !shouldShow;
            });
        };

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                filterProjects(button.dataset.filter || "all");
            });
        });

        /*
         * Initialize the gallery using the existing active filter,
         * or show all projects if no filter is marked active.
         */
        const initialFilter = filterButtons.find((button) =>
            button.classList.contains("active")
        );

        filterProjects(
            initialFilter?.dataset.filter || "all"
        );
    }


    /* =====================================================
       5. CONTACT FORM VALIDATION
       ===================================================== */

    const contactForm = getElement("#contact-form");
    const formStatus = getElement("#form-status");

    if (contactForm) {
        const nameField = getElement("#name");
        const phoneField = getElement("#phone");
        const emailField = getElement("#email");
        const serviceField = getElement("#service");
        const locationField = getElement("#project-location");
        const messageField = getElement("#message");

        const formFields = [
            nameField,
            phoneField,
            emailField,
            serviceField,
            locationField,
            messageField
        ].filter(Boolean);

        /*
         * This form deliberately has no invented submission endpoint.
         * Connect a real backend or form-processing service before
         * enabling actual enquiry submission.
         */
        const submissionServiceConnected = false;

        const errorMessages = new WeakMap();

        const setFormStatus = (message, isError = false) => {
            if (!formStatus) {
                return;
            }

            formStatus.textContent = message;
            formStatus.style.color = isError
                ? "#b42318"
                : "";
        };

        const getOrCreateErrorElement = (field) => {
            if (!field.id) {
                return null;
            }

            if (errorMessages.has(field)) {
                return errorMessages.get(field);
            }

            /*
             * Create an accessible inline message for the field.
             */
            const errorElement = document.createElement("span");

            errorElement.id = `${field.id}-error`;
            errorElement.className = "field-error";
            errorElement.setAttribute("aria-live", "polite");
            errorElement.hidden = true;

            field.insertAdjacentElement("afterend", errorElement);

            errorMessages.set(field, errorElement);

            return errorElement;
        };

        const showFieldError = (field, message) => {
            const errorElement = getOrCreateErrorElement(field);

            field.setAttribute("aria-invalid", "true");

            if (errorElement) {
                errorElement.textContent = message;
                errorElement.hidden = false;

                const describedBy = (
                    field.getAttribute("aria-describedby") || ""
                )
                    .split(/\s+/)
                    .filter(Boolean);

                if (!describedBy.includes(errorElement.id)) {
                    describedBy.push(errorElement.id);
                }

                field.setAttribute(
                    "aria-describedby",
                    describedBy.join(" ")
                );
            }
        };

        const clearFieldError = (field) => {
            field.removeAttribute("aria-invalid");

            const errorElement = errorMessages.get(field);

            if (errorElement) {
                errorElement.textContent = "";
                errorElement.hidden = true;

                const describedBy = (
                    field.getAttribute("aria-describedby") || ""
                )
                    .split(/\s+/)
                    .filter(Boolean)
                    .filter((id) => id !== errorElement.id);

                if (describedBy.length > 0) {
                    field.setAttribute(
                        "aria-describedby",
                        describedBy.join(" ")
                    );
                } else {
                    field.removeAttribute("aria-describedby");
                }
            }
        };

        const getFieldError = (field) => {
            const value = field.value.trim();

            if (field.required && !value) {
                return "This field is required.";
            }

            if (!value) {
                return "";
            }

            if (field === nameField && value.length < 2) {
                return "Please enter your full name.";
            }

            if (field === phoneField) {
                /*
                 * Allow common international phone formats.
                 * Require 7–15 digits and permit a leading plus sign.
                 */
                const phoneIsValid =
                    /^\+?[0-9().\-\s]+$/.test(value) &&
                    (value.match(/\d/g) || []).length >= 7 &&
                    (value.match(/\d/g) || []).length <= 15;

                if (!phoneIsValid) {
                    return "Enter a valid phone number with 7–15 digits.";
                }
            }

            if (field === emailField) {
                const emailIsValid =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

                if (!emailIsValid) {
                    return "Please enter a valid email address.";
                }
            }

            if (
                field === locationField &&
                value.length < 2
            ) {
                return "Please enter your project location.";
            }

            if (
                field === messageField &&
                value.length < 10
            ) {
                return "Please provide at least 10 characters of project details.";
            }

            return "";
        };

        const validateField = (field) => {
            const error = getFieldError(field);

            if (error) {
                showFieldError(field, error);
                return false;
            }

            clearFieldError(field);
            return true;
        };

        /*
         * Validate fields as visitors edit them, but avoid displaying
         * errors before the visitor has interacted with a field.
         */
        formFields.forEach((field) => {
            field.addEventListener("blur", () => {
                validateField(field);
            });

            field.addEventListener("input", () => {
                if (field.hasAttribute("aria-invalid")) {
                    validateField(field);
                }

                if (formStatus) {
                    setFormStatus("");
                }
            });

            field.addEventListener("change", () => {
                if (field.hasAttribute("aria-invalid")) {
                    validateField(field);
                }
            });
        });

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            setFormStatus("");

            let firstInvalidField = null;

            formFields.forEach((field) => {
                const isValid = validateField(field);

                if (!isValid && !firstInvalidField) {
                    firstInvalidField = field;
                }
            });

            /*
             * Use native HTML constraint validation as an additional
             * safeguard for required fields and input types.
             */
            if (
                firstInvalidField ||
                !contactForm.checkValidity()
            ) {
                if (!firstInvalidField) {
                    firstInvalidField = formFields.find(
                        (field) => !field.checkValidity()
                    );
                }

                setFormStatus(
                    "Please correct the highlighted fields before continuing.",
                    true
                );

                if (firstInvalidField) {
                    firstInvalidField.focus();
                }

                return;
            }

            /*
             * Do not pretend to send an email. A real submission service
             * must be connected before the form can deliver enquiries.
             */
            if (!submissionServiceConnected) {
                setFormStatus(
                    "Your details are valid, but this contact form is not connected to a submission service yet. Please contact us directly by phone, email, or WhatsApp.",
                    true
                );

                return;
            }

            /*
             * A real backend integration belongs here. This branch
             * remains disabled until a genuine submission mechanism
             * is implemented and its response can be verified.
             */
        });
    }


    /* =====================================================
       6. WHATSAPP CONTACT LINKS
       ===================================================== */

    const whatsappLinks = getElements(
        'a[href*="wa.me/"], a.floating-whatsapp'
    );

    whatsappLinks.forEach((link) => {
        /*
         * Normalize the destination to the company's official
         * WhatsApp contact number.
         */
        link.href = `https://wa.me/${WHATSAPP_NUMBER}`;

        /*
         * Keep external WhatsApp links in a separate tab.
         */
        link.target = "_blank";
        link.rel = "noopener noreferrer";
    });


    /* =====================================================
       7. BACK TO TOP
       ===================================================== */

    const backToTopButton = getElement("#back-to-top");

    if (backToTopButton) {
        const scrollThreshold = 350;
        let scrollUpdateScheduled = false;

        const updateBackToTopVisibility = () => {
            const shouldShow = window.scrollY > scrollThreshold;

            backToTopButton.classList.toggle(
                "visible",
                shouldShow
            );

            /*
             * The existing stylesheet also supports the "show" class.
             * Keep it synchronized for compatibility.
             */
            backToTopButton.classList.toggle(
                "show",
                shouldShow
            );

            backToTopButton.setAttribute(
                "aria-hidden",
                String(!shouldShow)
            );

            backToTopButton.tabIndex = shouldShow ? 0 : -1;

            scrollUpdateScheduled = false;
        };

        const scheduleBackToTopUpdate = () => {
            if (scrollUpdateScheduled) {
                return;
            }

            scrollUpdateScheduled = true;

            /*
             * requestAnimationFrame batches visual updates to avoid
             * repeated layout work during scrolling.
             */
            window.requestAnimationFrame(
                updateBackToTopVisibility
            );
        };

        window.addEventListener(
            "scroll",
            scheduleBackToTopUpdate,
            { passive: true }
        );

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth"
            });
        });

        /*
         * Set the correct initial state on page load.
         */
        updateBackToTopVisibility();
    }


    /* =====================================================
       8. SCROLL REVEAL ANIMATIONS
       ===================================================== */

    const revealSelectors = [
        ".about-image-wrapper",
        ".about-content",
        ".service-card",
        ".benefit-card",
        ".project-card",
        ".process-card",
        ".contact-information",
        ".contact-form-wrapper"
    ];

    const revealElements = getElements(
        revealSelectors.join(", ")
    );

    /*
     * Reveal animations are only enabled when motion is permitted
     * and IntersectionObserver is available. Otherwise, the content
     * remains visible without requiring JavaScript animation support.
     */
    if (
        revealElements.length > 0 &&
        !prefersReducedMotion.matches &&
        "IntersectionObserver" in window
    ) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-revealed");

                    observer.unobserve(entry.target);
                });
            },
            {
                root: null,
                rootMargin: "0px 0px -45px 0px",
                threshold: 0.08
            }
        );

        revealElements.forEach((element) => {
            /*
             * Add a state class for external CSS to use.
             * If no matching animation CSS exists, content remains
             * visible because no opacity is changed in JavaScript.
             */
            element.classList.add("reveal-ready");
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("is-revealed");
        });
    }


    /* =====================================================
       9. DYNAMIC COPYRIGHT YEAR
       ===================================================== */

    const currentYearElement = getElement("#current-year");

    if (currentYearElement) {
        currentYearElement.textContent = String(
            new Date().getFullYear()
        );
    }


    /* =====================================================
       10. QUOTE BUTTONS AND SECTION NAVIGATION
       ===================================================== */

    /*
     * The existing HTML uses href="#contact" for quote buttons.
     * Smooth scrolling is handled by the internal-link handler.
     *
     * This additional safeguard supports quote buttons that may
     * use the class name below without an explicit contact href.
     */
    const quoteButtons = getElements(
        ".header-quote-btn, .hero-buttons .btn-primary, .cta-actions .btn"
    );

    quoteButtons.forEach((button) => {
        if (
            button.tagName !== "A" ||
            button.hasAttribute("href")
        ) {
            return;
        }

        button.setAttribute(
            "href",
            `#${CONTACT_SECTION_ID}`
        );
    });

});
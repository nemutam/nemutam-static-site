/* ========================================================================
 * Bootstrap tooltips
 * ======================================================================== */

$('[data-toggle="tooltip"]').tooltip();

/* ========================================================================
 * Deobfuscate
 * ======================================================================== */

function deobfuscate(string) {
    var evenChars = [];
    var oddChars = [];
    for (var i = 0; i < string.length; i++) {
        if (i % 2 == 0) {
            evenChars.push(string[i]);
        } else {
            oddChars.push(string[i]);
        }
    }
    evenChars.reverse();
    var result = [];
    for (var i = 0; i < Math.max(evenChars.length, oddChars.length); i++) {
        if (i < evenChars.length) {
            result.push(evenChars[i]);
        }
        if (i < oddChars.length) {
            result.push(oddChars[i]);
        }
    }
    result = result.join('');
    return result;
}

$('.mail-link').each(function() {
    var href = deobfuscate($(this).attr('href').trim());
    var html = deobfuscate($(this).html().trim());
    $(this).attr('href', href);
    $(this).html(html);
});

/* ========================================================================
 * Utils
 * ======================================================================== */

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/* ========================================================================
 * Ads
 * ======================================================================== */

function logInteraction(type, data) {
    // console.log(type, data);
    $.ajax({
        method: 'POST',
        url: '/api/' + type + '_ad/',
        data: data,
        headers: {'X-CSRFToken': getCookie('csrftoken')},
    }).done(function(data, textStatus, jqXHR) {
        // console.log('resp:', data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(errorThrown);
    });
}

$('.ad-container img').click(function() {
    var data = {
        'campaign_id': this.dataset.campaignId,
        'device': this.dataset.device,
    }
    logInteraction('click', data);
});

var observerCallback = function(entries, observer) {
    $.each(entries, function(index, entry) {
        if (entry.isIntersecting) {
            var data = {
                'campaign_id': entry.target.dataset.campaignId,
                'device': entry.target.dataset.device,
            }
            logInteraction('view', data);
            observer.unobserve(entry.target);
        }
    });
}

var observer = new IntersectionObserver(observerCallback, {threshold: 0.9});

$('.ad-container img').each(function() {
    observer.observe(this);
});

/* ========================================================================
 * Saved listings
 * ======================================================================== */

if ($('.listing-buttons button').length !== 0) {

    // Get saved listing ids and toggle icons on page if needed.
    $.ajax({
        method: 'GET',
        url: '/api/get_saved_listing_ids/',
        headers: {'X-CSRFToken': getCookie('csrftoken')},
    }).done(function(data, textStatus, jqXHR) {
        // console.log('resp:', data);
        $('.listing-buttons button').each(function() {
            var listingId = parseInt(this.dataset.listingId);
            if (data.indexOf(listingId) !== -1){
                var icon = $(this).find('i');
                icon.removeClass('far');
                icon.addClass('fas');
            }
        });
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(errorThrown);
    });

    // Attach save listing button event handlers.
    $('.listing-buttons button').click(function() {
        var listingId = this.dataset.listingId;
        var data = {'listing_id': listingId};
        var icon = $(this).find('i');
        var newIconClassName = icon.hasClass('far') ? 'fas' : 'far';
        $.ajax({
            method: 'POST',
            url: '/api/toggle_save_listing/',
            data: data,
            headers: {'X-CSRFToken': getCookie('csrftoken')},
        }).done(function(data, textStatus, jqXHR) {
            // console.log('resp:', data);
            icon.removeClass('far fas');
            icon.addClass(newIconClassName);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    });

}

/* ========================================================================
 * Section
 * ======================================================================== */

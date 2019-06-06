function isEmpty(el) {
    return !jQuery.trim(el.html());
}

jQuery(document).ready(function () {

    if (isEmpty(jQuery("#UCCSAlert"))) {
        jQuery.ajax({
            url: "https://feedback.uccs.edu/cache/getFeeds.php?f=Alerts",
            timeout: 3000,
            dataType: 'jsonp',
            crossDomain: true,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //alert("An error has occurred making the request: " + errorThrown)
                if (window.console) {
                    console.error("An error has occurred making the request: " + errorThrown);
                }
            },
            success: function (data) {
                //alert('success!' + data.response);
                if(data.response != 'No Alert') {
                    jQuery('#UCCSAlert').append('<div class="uccs-alert">' + data.response + '</div>');
                    jQuery('#UCCSAlert').show();
                }

            }
        });
    } else {
        //alert("Failed Assertion");
        jQuery('#UCCSAlert').show();
    }
});
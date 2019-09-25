

jQuery(document).ready(function () {
  buildJumpNav();
});

function buildJumpNav() {
  // find all of the sections dynamically
  jQuery('.ucb-guide-content-row').each(function () {
    // grab the id
    sectId = jQuery(this).attr('id');
    sectLinkName = jQuery(this).data('link');

    // add them to the ul if we've got the data we need
    if (sectId && sectLinkName) {
      jQuery('#ucb-jump-nav').append(
        jQuery('<li>').append(
          jQuery('<a>').attr('href', '#' + sectId).append(sectLinkName)));
    }
  })

  // check to make sure we've got some jump links in the jump nav
  if(jQuery('#ucb-jump-nav li').length > 1) {
    jQuery('#ucb-jump-nav').css('display', 'flex');
  }
}


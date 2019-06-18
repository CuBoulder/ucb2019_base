/**************************************************
 *
 *   Main JS functionality for all pages.
 *
**************************************************/

jQuery(document).ready(function () {

    // handler to close the local tasks (edit, revisions, clone, etc...)
    jQuery('#ucbCloseLocalTasks').click(function (e) {
        e.preventDefault();

        jQuery('.ucb-local-tasks').hide();
    });

});
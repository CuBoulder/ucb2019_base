jQuery(document).ready(function () {
  /*
    How many milliseconds to wait before reloading the page
   */
  const reloadInterval = 1000 * 60 * 3; // reload every 3 minutes
  // Helper function for the Incident View
  IncidentView();

  //Handler to toggle the visibility of multiple Incident Nodes
  jQuery('a.ucb-incident-node-toggle').click(function (e) {
    e.preventDefault();
    var myTarget = jQuery(this).data('target');

    // hide all of the node items
    jQuery('ul.incident-list>li').hide();
    jQuery('a.ucb-incident-node-toggle.active').removeClass('active');

    // show the node item that they want
    jQuery('h1#'+myTarget).closest('ul.incident-list li').show();

    // set the active flag on the currently selected button
    jQuery('a.ucb-incident-node-toggle[data-target=' + myTarget + ']').addClass('active');
  })

  /*
    Reload the page
   */
  // setInterval(function () {
  //   window.location.reload();
  // }, reloadInterval);
});

function IncidentView() {
  // Determine how many active Incidents we have to work with.
  var IncidentList = jQuery('ul.incident-list');

  // If we have more than one active Incident then there's some work to do
  if( IncidentList && IncidentList.children().length > 1 ) {
    // add in a control structure to allow the user to toggle between different Incidents
    addIncidentToggle();
  }
}

function addIncidentToggle() {
  // grab the ids from the titles of each node and use those to create a button
  // to toggle between those nodes
  var IncidentNodes = jQuery('.ucb-incident-title-col h1');

  jQuery.each(IncidentNodes, function (index, value) {
    var myID = value.getAttribute('id');
    var myTitle = jQuery(value).find('span').html();
    jQuery('ol.ucb-incident-control-list').append("<li class='ucb-incident-toggle-li'><a href='#' class='ucb-incident-node-toggle' data-target='" + myID + "'>" + myTitle +"</a></li>");
  })

}


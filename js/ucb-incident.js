jQuery(document).ready(function () {
  /*
    How many milliseconds to wait before reloading the page
   */
  const reloadInterval = 1000 * 60; // reload every 60 seconds
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
    Reload the page periodically
   */
  // setInterval(function () {
  //   window.location.reload();
  // }, reloadInterval);

  /*
   * Collapse the body of the updates if there are more than 3
   * styles in ucb-incident-page.css
   */
  collapseUpdates();

});


function collapseUpdates(){
  let updates = document.getElementsByClassName('ucb-incident-event-body'); // the update bodies
  let parents = document.getElementsByClassName('ucb-incident-event-card'); // the cards
  let arr = Array.from(updates);
  if(arr.length > 3){
      for(let i=3; i< arr.length; i++){
          let showUpdate = document.createElement("a");
          showUpdate.setAttribute('class', 'ucb-toggle-update-body');
          showUpdate.setAttribute('href', '#');
          showUpdate.addEventListener('click', e => toggleUpdate(e), false); // add click event to toggle the update body
          showUpdate.innerHTML = '<i class="fas fa-plus-square"></i> Read More';
          parents[i].insertBefore(showUpdate, updates[i]);                   // insert the <p> right before the event body
          updates[i].style.display = 'none';                                 // hide the update body
          if(updates[i].nextElementSibling){
            updates[i].nextElementSibling.style.display ='none';             // hide the map if there is one
          }
      }
  }
}

function toggleUpdate(e){
  e.preventDefault();
  let status = e.currentTarget.nextElementSibling.style.display;  // block | none
  if(status === 'none'){
      // nextElementSibling is the update body
      e.currentTarget.nextElementSibling.style.display = 'block'; // show the update
      if(e.currentTarget.nextElementSibling.nextElementSibling){  // check if a map exists
        e.currentTarget.nextElementSibling.nextElementSibling.style.display = 'block';
      }
      e.currentTarget.innerHTML = '<i class="fas fa-minus-square"></i> Show Less';
  }
  else{
      e.currentTarget.nextElementSibling.style.display = 'none'; // hide the update again
      if(e.currentTarget.nextElementSibling.nextElementSibling){
        e.currentTarget.nextElementSibling.nextElementSibling.style.display = 'none';
      }
      e.currentTarget.innerHTML = '<i class="fas fa-plus-square"></i> Read More';
  }
}

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

 $(function () {

    getDraggableEvents() // get the draggable events to be inited
    /* initialize the external events
     -----------------------------------------------------------------*/
    function ini_events(ele) {
      ele.each(function () {

        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
          title: $.trim( $(this).text()) // use the element's text as the event title
        }

        console.log(eventObject)

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject)

        // make the event draggable using jQuery UI
        $(this).draggable({
          zIndex        : 1070,
          revert        : true, // will cause the event to go back to its
          revertDuration: 300  //  original position after the drag
        })

      })
    }

    ini_events($('#external-events div.external-event'))

    /* initialize the calendar
     -----------------------------------------------------------------*/
    //Date for the calendar events (dummy data)
    var date = new Date()
    var d    = date.getDate(),
        m    = date.getMonth(),
        y    = date.getFullYear()

    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;

    var containerEl = document.getElementById('external-events');
    var checkbox = document.getElementById('drop-remove');
    var calendarEl = document.getElementById('calendar');

    // initialize the external events
    // -----------------------------------------------------------------

    new Draggable(containerEl, {
      itemSelector: '.external-event',
      eventData: function(eventEl) {
        
        return {
          title: eventEl.innerText.replace('✘','').replace('\n',''),
          backgroundColor: window.getComputedStyle( eventEl ,null).getPropertyValue('background-color'),
          borderColor: window.getComputedStyle( eventEl ,null).getPropertyValue('background-color'),
          textColor: window.getComputedStyle( eventEl ,null).getPropertyValue('color')
        };
      }
    });

   // var events2 = [
   //      {
   //        title          : 'All Day Event',
   //        start          : new Date(y, m, 1),
   //        backgroundColor: '#f56954', //red
   //        borderColor    : '#f56954', //red
   //        allDay         : true
   //      },
   //      {
   //        title          : 'Long Event',
   //        start          : new Date(y, m, d - 5),
   //        end            : new Date(y, m, d - 2),
   //        backgroundColor: '#f39c12', //yellow
   //        borderColor    : '#f39c12' //yellow
   //      },
   //      {
   //        title          : 'Meeting',
   //        start          : new Date(y, m, d, 10, 30),
   //        allDay         : false,
   //        backgroundColor: '#0073b7', //Blue
   //        borderColor    : '#0073b7' //Blue
   //      },
   //      {
   //        title          : 'Lunch',
   //        start          : new Date(y, m, d, 12, 0),
   //        end            : new Date(y, m, d, 14, 0),
   //        allDay         : false,
   //        backgroundColor: '#00c0ef', //Info (aqua)
   //        borderColor    : '#00c0ef' //Info (aqua)
   //      },
   //      {
   //        title          : 'Birthday Party',
   //        start          : new Date(y, m, d + 1, 19, 0),
   //        end            : new Date(y, m, d + 1, 22, 30),
   //        allDay         : false,
   //        backgroundColor: '#00a65a', //Success (green)
   //        borderColor    : '#00a65a' //Success (green)
   //      },
   //      {
   //        title          : 'Click for Google',
   //        start          : new Date(y, m, 28),
   //        end            : new Date(y, m, 29),
   //        url            : 'http://google.com/',
   //        backgroundColor: '#3c8dbc', //Primary (light-blue)
   //        borderColor    : '#3c8dbc' //Primary (light-blue)
   //      }
   //    ]

//---------------------------------------------------------------------------
  function setEvents(){

    //get from the .json file all the events

    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", 'arq-ctrl.php', false);
    xhttp.send();
    
   if (xhttp.responseText > ''){ 
    let response = JSON.parse(xhttp.responseText)

    for(let i in response){
         response[i].start = new Date(response[i].start)
         response[i].end = new Date(response[i].end)
         response[i].allDay = response[i].allDay == 'true' ? true : false
       }
       return response
     }
  }

  var allEvents = []
    function getEvents() { 

      //send to server a JSON with all events
      //it will be saved in a .json file
      //using object calendarObj.renderableEventStore to get the events from the calendar
      //console.log(calendarObj.renderableEventStore)

      var obj = calendarObj.renderableEventStore
      let count = 0
      for (let i in obj.instances) {

         allEvents[count] = {
                            title          : obj.defs[ obj.instances[i].defId ].title,
                            start          : formatDate(obj.instances[i].range.start),
                            end            : formatDate(obj.instances[i].range.end),
                            allDay         : obj.defs[ obj.instances[i].defId ].allDay,
                            backgroundColor: obj.defs[ obj.instances[i].defId ].ui.backgroundColor,
                            borderColor    : obj.defs[ obj.instances[i].defId ].ui.borderColor
                        }
        count++
      }

      $.ajax({
        url: 'arq-ctrl.php',
        type: 'POST',
        dataType :'html',
        data: {'allEvents':allEvents}
      })
    }

  var events = setEvents()
//----------------------------------------------------------------------------

    var calendarObj = new Calendar(calendarEl, {
      plugins: [ 'bootstrap', 'interaction', 'dayGrid', 'timeGrid' ],
      header    : {
        left  : 'prev,next today',
        center: 'title',
        right : 'timeGridDay,timeGridWeek,dayGridMonth'
      },
      'themeSystem': 'bootstrap',
      events    : events,
      editable  : true,
      droppable : true, // this allows things to be dropped onto the calendar !!!
      drop      : function(info) {
        // is the "remove after drop" checkbox checked?
       
        console.log(info)

        if (checkbox.checked) {
          // if so, remove the element from the "Draggable Events" list
          info.draggedEl.parentNode.removeChild(info.draggedEl);
          setDraggableEvents() //atualize the .json file of draggable events
        }
        setTimeout(()=>{ getEvents() }, 100)
      }    
    });


//----------------------------------------------------------------------------
    function formatDate(dat){ 
    //format date BRAZIL (pt-BR)
      let date = new Date(dat)
      let d = date.getDate()
      let m = date.getMonth()
      let y = date.getFullYear()
      let h = date.getHours()
      let i = date.getMinutes()
      return new Date(y, m, d, h+3, i)
    }

//--------------------------------------------------------------------------

  //its constantly verifying if the object 'calendarObj.renderableEventStore' was be altered to be saved
    var atualize = []
    atualize[0] = calendarObj.renderableEventStore
    setInterval(()=>{ 
      atualize[1] = calendarObj.renderableEventStore
      if (atualize[0] != atualize[1]) {
        getEvents()
        atualize[0] = calendarObj.renderableEventStore
      }
     }, 500)

//-----------------------------------------------------------------------------
    // set text portuguese
    let optsButtonText = {
      day: "dia",
      list: "lista",
      month: "mês",
      next: "next",
      nextYear: "next year",
      prev: "prev",
      prevYear: "prev year",
      today: "hoje",
      week: "semana",
      year: "ano"
    }

    calendarObj.dateEnv.locale.codeArg = "pt"
    calendarObj.dateEnv.locale.codes = ["pt"]
    calendarObj.dateEnv.locale.options.buttonText = optsButtonText
    calendarObj.dateEnv.locale.options.allDayText = 'dia-todo'

    calendarObj.theme.calendarOptions.buttonText = optsButtonText
    calendarObj.theme.calendarOptions.allDayText = 'dia-todo'

    calendarObj.viewSpecs.timeGrid.options.buttonText = optsButtonText
    calendarObj.viewSpecs.timeGridDay.buttonTextDefault = 'dia'
    calendarObj.viewSpecs.timeGridWeek.buttonTextDefault = 'semana'
    calendarObj.viewSpecs.dayGridMonth.buttonTextDefault = 'mês'

   
    calendarObj.render(); // render calendar

//-----------------------------------------------------------------------------

    /* ADDING EVENTS */
    var currColor = '#00c0ef' //info by default
    //Color chooser button
    var colorChooser = $('#color-chooser-btn')
    $('#color-chooser > li > a').click(function (e) {
      e.preventDefault()
      //Save color
      currColor = $(this).css('color')
      //Add color effect to button
      $('#add-new-event').css({
        'background-color': currColor,
        'border-color'    : currColor
      })
    })
    $('#add-new-event').click(function (e) {
      e.preventDefault()
      //Get value and make sure it is not null
      var val = $('#new-event').val()
      if (val.length == 0) {
        return
      }

      //Create events
      var event = $('<div />')
      event.css({
        'background-color': currColor,
        'border-color'    : currColor,
        'color'           : '#fff'
      }).addClass('external-event')
      let close = document.createElement('a')
      event.html(val)
      $('#external-events').prepend(event)


      //Add draggable funtionality
      ini_events(event)
      addDeleteDEvent()
      setDraggableEvents() //atualize the .json file of draggable events

      //Remove event from text input
      $('#new-event').val('')

    })

//--------------------------------------------------------------------------
 function setDraggableEvents(){
      //send a ajax request to server with any contents of the draggable events
      //its will be saved in a .json file
      
      let eventsD = document.querySelectorAll('.external-event'); //get all draggable events
      let classesEvents = []

      for (var i = 0; i < eventsD.length; i++) { //put the events in an array
              classesEvents[i] = {
                  text: String(eventsD[i].innerText.replace('✘','').replace('\n','')), //replace ✘ to '' else its would be saved
                  color: eventsD[i].style.backgroundColor
              }
            }

      $.ajax({ //send to server to be saved
        url: 'draggable-events.php',
        type: 'POST',
        dataType :'html',
        data: {'event': classesEvents > '' ? classesEvents : 'delete'}
      })
    }

    function getDraggableEvents(){
      //send a request to server to get the draggable events
      let wrapper = document.querySelector('#external-events')

      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", 'draggable-events.php', false);
      xhttp.send();

     if(xhttp.response > '') {
       let response = JSON.parse(xhttp.response)
       for (var i = 0; i < response.length; i++) {
        //set the events in the wrapper
         wrapper.innerHTML += `<div id="d-event-${i}" class="external-event ui-draggable ui-draggable-handle" style="background-color: ${response[i].color}; color: #FFF">
                                ${response[i].text}
                               </div>`
       }
       addDeleteDEvent()
     }
     
    }

    function addDeleteDEvent(){ // add the ✘ in all draggable elements

      let eventsD = document.querySelectorAll('.external-event'); //get all draggable events
      for (var i = 0; i < eventsD.length; i++) {

        if(eventsD[i].innerHTML.indexOf(`<a class="removeDEvent">✘</a>`) == -1){
          eventsD[i].innerHTML += `<a class="removeDEvent">✘</a>`
        }
      }
      deleteDEvent()
    }

    function deleteDEvent(){ // add event click in ✘
      let ele = document.querySelectorAll(`.removeDEvent`)
      for(let i=0; i<ele.length; i++){
        ele[i].addEventListener('click', ()=>{
          ele[i].parentElement.remove()
          setDraggableEvents()
        })
      }
    }
})


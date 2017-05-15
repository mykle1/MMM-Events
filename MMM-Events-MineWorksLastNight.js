/* Magic Mirror
 * Module: MMM-Events
 *
 * By Mykle1
 * 
 */
Module.register("MMM-Events", {

    // Module config defaults.
    defaults: {
        fadeSpeed: 2200,
        updateInterval: 60 * 60 * 1000, // 60 minutes
        animationSpeed: 3000,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        useHeader: false,
        header: "",
        MaxWidth: "100%",
        cityCode: "new+york",   // Add + between city names
		rotateInterval: 5 * 60 * 1000,  // New Event Appears
		apikey: "",   
    },
	
	
    
    getStyles: function () {
		return ["MMM-Events.css"];
	},

    start: function() {
        Log.info("Starting module: " + this.name);

		 requiresVersion: "2.1.0",
		 
        // Set locale.
        this.url = this.getEventsUrl();
        this.today = "";
		this.event = {};  // =this.event = null so it starts at the beginning :)
		this.activeItem = 0; // null so it starts at the beginning ..Everthing starts at 0
        this.rotateInterval = null; // Nothing rotating so start
        this.scheduleUpdate();		
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Upcoming Events...";
            wrapper.classList.add("dimmed", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }
        
            var keys = Object.keys(this.event);  //it's just how parse and loop over data
			if(keys.length > 0){
           	if(this.activeItem >= keys.length){
				this.activeItem = 0;
			}
         var events = this.event[keys[this.activeItem]];
			
			 //tells you what item to show :)
             //var performers = events.performers.performer;   
			//if (typeof performers != "undefined") {
         console.log("HI");
                    //}	
			
        // This is for the title of show
           var eventsColumn1 = document.createElement("div");
		   var eventsDate1 = document.createElement("p");               
           eventsDate1.classList.add("small", "bright", "now");
           eventsDate1.innerHTML = events.title;  //layers is like path in json data
           eventsColumn1.appendChild(eventsDate1);
           wrapper.appendChild(eventsColumn1);
		   
		 // This is for the venue name
           var eventsColumn2 = document.createElement("div");
		   var eventsDate2 = document.createElement("p");               
           eventsDate2.classList.add("xsmall", "bright", "now");
           eventsDate2.innerHTML = events.venue_name;  //layers is like path in json data
           eventsColumn2.appendChild(eventsDate2);
           wrapper.appendChild(eventsColumn2);
		   
		   // This is for the venue address
           var eventsColumn4 = document.createElement("div");
		   var eventsDate4 = document.createElement("p");               
           eventsDate4.classList.add("xsmall", "bright", "now");
           eventsDate4.innerHTML = events.venue_address;  //layers is like path in json data
           eventsColumn4.appendChild(eventsDate4);
           wrapper.appendChild(eventsColumn4);
		   
		   // This is for the date and time of show
           var eventsColumn3 = document.createElement("div");
		   var eventsDate3 = document.createElement("p");               
           eventsDate3.classList.add("xsmall", "bright", "now");
           eventsDate3.innerHTML = events.start_time;  //layers is like path in json data
           eventsColumn3.appendChild(eventsDate3);
           wrapper.appendChild(eventsColumn3);
		   
		   // This is for the picture
           var eventsLogo = document.createElement("div");
           var eventsIcon = document.createElement("img");
           eventsIcon.src = events.image.medium.url;
           eventsIcon.classList.add("imgDes");
           eventsLogo.appendChild(eventsIcon);
           wrapper.appendChild(eventsLogo);  
        }
        return wrapper;
    },

    processEvents: function(data) {
	this.today = data.Today;
	this.event = data.event;
	this.perform = data.performers;
	this.loaded = true;
	this.nick = data.name; // trying to define name
	},
	
	scheduleCarousel: function() {
       		console.log("Scheduling Events");
	   		this.rotateInterval = setInterval(() => {
				this.activeItem++; //DON"T PLAY WITH
				this.updateDom(this.config.animationSpeed);
			}, this.config.rotateInterval);  //you can add this a config option
	   },

     scheduleUpdate: function() {
         setInterval(() => {
             this.getEvents();
         }, this.config.updateInterval);
         this.getEvents(this.config.initialLoadDelay);
         var self = this;
     },
    getEventsUrl: function() {
        var url = null;
		var today = new Date();
        var eventsYear = today.getMonth() + 1;  
        var cityCode = this.config.cityCode.toLowerCase();
		var apikey = this.config.apikey;
        url = "http://api.eventful.com/json/events/search?app_key="+apikey+"&location="+cityCode+"&date=This+Week&keywords=concert&sort_order=popularity&sort_direction=descending&image_sizes=medium";
        return url;
    },

    getEvents: function() {
        this.sendSocketNotification('GET_EVENTS', this.url);
    },
	
	
	socketNotificationReceived: function(notification, payload) {
         if (notification === "EVENTS_RESULT") {
             this.processEvents(payload);
             if(this.rotateInterval == null){
			   	this.scheduleCarousel();  //this is what fires the carousel :)
			   }
               this.updateDom(this.config.animationSpeed);
         }
         this.updateDom(this.config.initialLoadDelay);
     },	
});

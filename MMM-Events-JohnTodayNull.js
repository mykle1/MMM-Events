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
        MaxWidth: "30%",
        cityCode: "elmira", // Add + between city names
        rotateInterval: 10 * 1000, // New Event Appears
        apikey: "",
    },



    getStyles: function() {
        return ["MMM-Events.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

            // Set locale.
            this.url = this.getEventsUrl();
        this.event = {}; // =this.event = starts as an empty set :)
        this.activeItem = 0; // 0 so it starts at the beginning ..Everthing starts at 0
        this.rotateInterval = null; // Nothing ...... so start rotating at the beginning
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
            header.innerHTML = "Events for " + this.config.cityCode;
            wrapper.appendChild(header);
        }

        var keys = Object.keys(this.event); //it's just how to loop over data
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var events = this.event[keys[this.activeItem]];

            //tells you what item to show :)
            //var performers = events.performers.performer;
            //if (typeof performers != "undefined") {
            console.log("HI");
            //}
            var top = document.createElement("div");
            top.classList.add("list-row");

            // This is for the title of show


            var eventsDate1 = document.createElement("div");
            eventsDate1.classList.add("xsmall", "bright");
            eventsDate1.innerHTML = events.title;
            //infoColumn.appendChild(eventsDate1);
            wrapper.appendChild(eventsDate1);

            var eventsLogo = document.createElement("div");
            var eventsIcon = document.createElement("img");
            eventsIcon.src = events.image.medium.url;
            eventsIcon.classList.add("list-left");
            eventsLogo.appendChild(eventsIcon);
            wrapper.appendChild(eventsLogo);

            var rightDiv = document.createElement("div");
            rightDiv.classList.add("list-right");

            var eventsDate2 = document.createElement("div");
            eventsDate2.classList.add("xsmall", "bright", "list-title", "top-div");
            eventsDate2.innerHTML = events.venue_name;

            wrapper.appendChild(eventsDate2);


            var eventsDate4 = document.createElement("div");
            eventsDate4.classList.add("xsmall", "bright", "list-title");
            eventsDate4.innerHTML = events.venue_address;

            wrapper.appendChild(eventsDate4);

            var now = new Date(events.start_time);
            var date = now.toLocaleDateString();
            var time = now.toLocaleTimeString(navigator.language, {
                hour: '2-digit',
                minute: '2-digit'
            });

            var eventsDate3 = document.createElement("div");
            eventsDate3.classList.add("xsmall", "bright", "list-title");
            if (time != "12:00 AM"){
			eventsDate3.innerHTML = "Date: " + date + "<br> Time: " + time;	
			} else {
			eventsDate3.innerHTML = "Date: " + date + "<br> Time: No Time Listed";	
			}
            wrapper.appendChild(eventsDate3);

        }
        return wrapper;
    },

    processEvents: function(data) {
        this.event = data.event;
        this.perform = data.performers;
        this.loaded = true;
        this.nick = data.name; // trying to define name
    },

    getDate: function(date) {


        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        var today = mm + '/' + dd + '/' + yyyy;
        var month = mm;
    },

    scheduleCarousel: function() {
        console.log("Scheduling Events");
        this.rotateInterval = setInterval(() => {
            this.activeItem++; //DON"T PLAY WITH
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval); //you can add this a config option
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
        url = "http://api.eventful.com/json/events/search?app_key=" + apikey + "&location=" + cityCode + "&date=This+Week&keywords=concert&sort_order=popularity&sort_direction=descending&image_sizes=medium";
        return url;
    },

    getEvents: function() {
        this.sendSocketNotification('GET_EVENTS', this.url);
    },


    socketNotificationReceived: function(notification, payload) {
        if (notification === "EVENTS_RESULT") {
            this.processEvents(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel(); //this is what fires the carousel :)
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});

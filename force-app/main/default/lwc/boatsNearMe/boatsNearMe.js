import { LightningElement,wire,api,track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';  
// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
 @api boatTypeId;
 @api  boats;
 @track mapMarkers = [];
 @track mapCenter={};
  isLoading = true;
  isRendered=false;
  latitude;
  longitude;
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  @wire (getBoatsByLocation,{latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
  wiredBoatsJSON({error, data}) { 
    console.log('@@ data by location'+JSON.stringify(data));
     if (data) {
        this.createMapMarkers(data);
       
     } else if (error) {
        const toast = new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.message,
            variant: ERROR_VARIANT,
        });
        this.dispatchEvent(toast);
  }
  this.isLoading = false;
}
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
    if (!this.isRendered) {
        this.getLocationFromBrowser();
        
    }
    this.isRendered = true;
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() { 
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.isLoading = true; // Set loading to true before fetching data
            },
            (error) => {
                this.showToast(ERROR_TITLE, error.message, ERROR_VARIANT);
            }
        );


    }
    else {
        this.showToast(ERROR_TITLE, 'Geolocation not supported', ERROR_VARIANT);
    }
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
    const newMarkers = JSON.parse(boatData).map(boat => {
        return {
            title: boat.Name,
            location: {
                Latitude: boat.Geolocation__Latitude__s,
                Longitude: boat.Geolocation__Longitude__s
            }
        };
    });
    
    // Add a marker for the user's location
    newMarkers.unshift({
        location: {
            Latitude: this.latitude,
            Longitude: this.longitude
        },
        title: LABEL_YOU_ARE_HERE,
        icon: ICON_STANDARD_USER
    });
    // this.mapCenter = { Latitude: this.latitude, Longitude: this.longitude }; 
    this.mapMarkers = newMarkers;
   
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});
   }
   selectBoat(boatTypeId) {
    // Creating and dispatching the custom 'select' event with the selected boat's ID
    const selectEvent = new CustomEvent('select', {
        detail: { boatTypeId }
    });
    this.dispatchEvent(selectEvent);
}
   showToast(title, message, variant) {
    this.dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        })
    );
}
}


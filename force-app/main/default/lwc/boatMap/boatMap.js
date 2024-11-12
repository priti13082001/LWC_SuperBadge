// import BOATMC from the message channel
import { LightningElement, wire, track,api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { subscribe, APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];
// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  boatId;
  mapCenter = {};

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  @track error = undefined;
 @track mapMarkers = [];

  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext;
  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    console.log('@@data'+JSON.stringify(data));
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribes to the message channel
  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
    this.subscription = subscribe(this.messageContext, BOATMC, (message) => {
      this.boatId = message.recordId;}, { scope: APPLICATION_SCOPE });
  }
//   handleMessage(message) {
//     if(message.recordId){
//       this.boatId = message.recordId;

//       console.log('Received boatId:', this.boatId);

//     }
   
// }

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  // Creates the map markers array with the current boat's location for the map.
  updateMap(longitude, latitude) {
  //   if(longitude && latitude){
  //   console.log('@@Longitude'+longitude);
  //   console.log('@@Latitude'+latitude);
  //   this.mapMarkers = [{
  //     location: {
  //         Latitude: latitude,
  //         Longitude: longitude
  //     },
  //     title: 'Boat Location'
     

  // }];
  // this.mapCenter = { Latitude: latitude, Longitude: longitude }; 
  // }
  this.mapMarkers = [{location: { longitude, latitude }}];
}

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}
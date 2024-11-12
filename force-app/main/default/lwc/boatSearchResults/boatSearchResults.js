import { LightningElement, wire,api,track} from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import {ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT  = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  @api selectedBoatId;
  columns = [
    { label: 'Name', fieldName: 'Name', type: 'text',editable: true  },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' ,editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number',editable: true  },
    { label: 'Description', fieldName: 'Description__c'},  
];
  boatTypeId = '';
  boats;
  @track isLoading = false;
   draftValues = [];
  
  // wired message context
  //messageContext;
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats,{boatTypeId: '$boatTypeId'})
  wiredBoats(result) {
    console.log('@@ result'+JSON.stringify(result.data));
     if (result.data) {
       //  this.columns = BOAT_COLUMNS;
         this.boats = result.data;
         this.error = undefined;

     } else if (result.error) {
         this.error = result.error;
         this.boats = undefined;
     }
   }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 
    this.isLoading = true;
    this.boatTypeId = boatTypeId;
    this.notifyLoading(this.isLoading);
  }
  @api
  async refresh() {
      this.isLoading = true;
      this.notifyLoading(this.isLoading);      
      await refreshApex(this.boats);
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
  }
  handleSelect(event) {
    console.log('@@event details'+JSON.stringify(event.detail));
    const payload = { recordId: event.detail.boatId }; // Boat ID from the selected boat
    publish(this.messageContext, BOATMC, payload);
}
handleLoad(event) {
  this.isLoading = false;
}


handleLoadMore(event) {
  this.isLoading = true;
  // Logic to load more boats if applicable
}
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  refresh() {
    this.notifyLoading(true);
   }
  
  // this function must update selectedBoatId and call sendMessageService
  handleBoatSelect(event) {
    console.log('@@ event.detail'+JSON.stringify(event.detail));
    const selectBoatId = event.detail.boatId;
    this.updateSelectedTile(selectBoatId);
  }
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
   }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const message = {
        recordId: boatId
    };
    publish(this.messageContext, BOATMC, message);
    // explicitly pass boatId to the parameter recordId
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
   
    console.log('@@ event.detail.draftValues'+JSON.stringify(event.detail.draftValues));
    const updatedFields = event.detail.draftValues;

    // Update the records via Apex
    updateBoatList({data: updatedFields})
        .then(result => {
            const toast = new ShowToastEvent({
                title: SUCCESS_TITLE,
                message: MESSAGE_SHIP_IT,
                variant: SUCCESS_VARIANT,
            });
            this.dispatchEvent(toast);
            this.draftValues = [];
            return this.refresh();
        })
        .catch(error => {
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.message,
                variant: ERROR_VARIANT,
            });
            this.dispatchEvent(toast);
        })
        .finally(() => {
            
        });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
  } else {
      this.dispatchEvent(CustomEvent('doneloading'));
  }        
   }
}

import { LightningElement, wire,track } from 'lwc'; 
 import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';
    @track searchOptions = []; // Initialize as an empty array
    
    // Private
    error = undefined;
    
   
    
    // Wire a custom Apex method
     @wire(getBoatTypes)
      boatTypes({ error, data }) {
        console.log('Fetched boat types:', data); 
      if (data) {
        this.searchOptions = data.map(type => {
          // TODO: complete the logic
          return {
            label: type.Name,
            value: type.Id
          };
        });
        this.searchOptions.unshift({ label: 'All Types', value: '' });
      } else if (error) {
        this.searchOptions = undefined;
        this.error = error;
      }
      console.log('@@ searchOption'+ this.searchOptions);
    }
    
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        this.selectedBoatTypeId = event.detail.value;
        const searchEvent = new CustomEvent('search', {
            detail: { boatTypeId: this.selectedBoatTypeId }
        });
        this.dispatchEvent(searchEvent);
      // Create the const searchEvent
      // searchEvent must be the new custom event search
    
      this.dispatchEvent(searchEvent);
    }
  }
  
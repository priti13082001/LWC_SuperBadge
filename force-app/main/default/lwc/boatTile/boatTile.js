 import { LightningElement, api } from 'lwc';
 import BOAT_IMAGE from '@salesforce/resourceUrl/BOAT_IMAGE';
 const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
 export default class BoatTile extends LightningElement {
        @api boat;
        @api  selectedBoatId;
       
    
    // Getter for dynamically setting the background image for the picture  //this.boat.Picture__c
    get backgroundStyle() { 
        return this.boat && this.boat.Picture__c 
        ? `background-image: url(${BOAT_IMAGE});` 
        :  'background-color: #f0f0f0;';

    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
     get tileClass() { 
          console.log('@@ inside the tileclass');
        return this.boat && this.boat.Id === this.selectedBoatId ? TILE_WRAPPER_SELECTED_CLASS : TILE_WRAPPER_UNSELECTED_CLASS;
        
     }
    
    // Fires event with the Id of the boat that has been selected.
   @api selectBoat() { 
       console.log('@@ inside the select boat');
       this.selectedBoatId=this.boat.Id;
        const selectEvent = new CustomEvent('boatselect', {
            detail: { boatId: this.boat.Id },
        });
        this.dispatchEvent(selectEvent);

    }
  }
import { LightningElement, wire } from 'lwc';
import { getFieldValue } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import { subscribe, APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { NavigationMixin } from 'lightning/navigation';
// Custom Labels
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Fields
import BOAT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';


// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  activeTabValue;
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
 
@wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
wiredRecord;
  // Utilize getFieldValue to extract the boat name from the record wire
  get detailsTabIconName() { 
    return this.wiredRecord.data ? 'utility:anchor' : null;
  }
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
}
  @wire (MessageContext)
  messageContext;
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    if (this.subscription) {
        return;
    }
    this.subscription = subscribe(this.messageContext, BOATMC, (message) => {
        this.boatId = message.recordId;
    },  { scope: APPLICATION_SCOPE });
    // local boatId must receive the recordId from the message
  }
  
  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
   }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: this.boatId,
          objectApiName: "Boat__c",
          actionName: "view"
      },
  });
}


  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    
   }
}
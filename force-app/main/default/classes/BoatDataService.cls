public with sharing class BoatDataService {
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        return [select id, Name from BoatType__c Order by Name];
       
    }
    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(String boatTypeId){
        String query = 'select id, Name, BoatType__c, Contact__c, Picture__c, Price__c, Length__c, Description__c,Contact__r.Name,BoatType__r.Name from Boat__c';
        if (boatTypeId == '') {
            return [select id, Name, BoatType__c, Contact__c, Picture__c, Price__c, Length__c,Contact__r.Name,BoatType__r.Name, Description__c from Boat__c];
        }else {
            query = query + ' where BoatType__c = :boatTypeId';
        }
        
        
        return Database.query(query);}

        @AuraEnabled
        public static string updateBoatList(Object data){
            // Perform isUpdatable() checking first, then
            List<Boat__c> boatsForUpdate = (List<Boat__c>) JSON.deserialize(JSON.serialize(data),List<Boat__c>.class);
            try {
                update boatsForUpdate;
                return 'Success: Boats updated successfully';
            } catch (Exception e) {
                return 'The following exception has occurred: ' + e.getMessage();
            }
           
        }
        @AuraEnabled(cacheable=true)
        public static String getBoatsByLocation(Decimal latitude, Decimal longitude, String boatTypeId){
            String query = 'select id, Name, BoatType__c, Contact__c, Picture__c, Price__c, Geolocation__Latitude__s, Geolocation__Longitude__s from Boat__c ';

            if (String.isBlank(boatTypeId)) {
                query += ' where DISTANCE(Geolocation__c, GEOLOCATION('+latitude+', '+longitude+'), \'mi\') < 20';
               

            }else {
                query += 'where BoatType__c =:boatTypeId AND DISTANCE(Geolocation__c, GEOLOCATION('+latitude+', '+longitude+'), \'mi\') < 20';
                
            }
            return JSON.serialize(Database.query(query));
        }

        @AuraEnabled
        public static List<BoatReview__c> getAllReviews(Id boatId){
            return [
                SELECT
                    Id,
                    Name,
                    Comment__c,
                    Rating__c,
                    LastModifiedDate,
                    CreatedDate,
                    CreatedBy.Name,
                    CreatedBy.SmallPhotoUrl,
                    CreatedBy.CompanyName
                FROM
                    BoatReview__c
                WHERE
                    Boat__c =:boatId
                ORDER BY
                    CreatedDate DESC
            ];  
        }
        // @AuraEnabled(cacheable=true)
        // public static void setReview(Id boatId, String reviewName, String reviewComment, Integer reviewRating){
        //     BoatReview__c newReview = new BoatReview__c(
        //         Boat__c = boatId,
        //         Name = reviewName,
        //         Comment__c = reviewComment,
        //         Rating__c = reviewRating
        //     );
        //     insert newReview;
        // }
       

         @AuraEnabled(cacheable=true)
         public static  List<boat__c> getSimilarBoats(Id boatId,String similarBy){
            // Validate the inputs
        if (String.isBlank(boatId) || String.isBlank(similarBy)) {
            throw new AuraHandledException('Invalid parameters: boatId and similarBy are required');
        }

        // Retrieve the current boat record to determine criteria for similarity
        Boat__c currentBoat = [SELECT Id, BoatType__c, Length__c,Price__c FROM Boat__c WHERE Id = :boatId LIMIT 1];

        // Define the query based on the similarBy parameter
        String query = 'SELECT Id, Name, BoatType__c, Length__c,Price__c FROM Boat__c WHERE Id != :boatId';

        // Apply similarity filter based on the similarBy parameter
        if (similarBy == 'Type') {
            query += ' AND Type__c = :currentBoat.BoatType__c';
        } else if (similarBy == 'Length') {
            query += ' AND Length__c = :currentBoat.Length__c';
        } else if (similarBy == 'Price') {
            query += ' AND Manufacturer__c = :currentBoat.Price__c';
        }

        // Execute the dynamic query
        List<Boat__c> similarBoats = Database.query(query);

        return similarBoats;

         }       

}
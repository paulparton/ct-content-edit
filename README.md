#Content Edit#
An angular directive for templated editable content definitions

##Demo##
A demo is available at <a href=''>www.paulparton.com/contentedit</a>

##Usage##

    //View 

    //Attributes
    // ct-content-container: template name (viewTemplate|editTemplate)
    // model: a variable attached to $scope.content 
    // name: The human readable content name (displayed on label)

    <span ct-content-container="div|text" model="fullName" name="Full Name"></span>
    <span ct-content-container="div|text" model="favColour" name="Favourite Colour"></span>

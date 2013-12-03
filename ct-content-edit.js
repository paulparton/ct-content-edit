
//Create the contentTools module
var contentTools = angular.module('contentTools',[]);

//contentContainer directive
contentTools.directive('ctContentContainer', function ($templateCache, $rootScope) {

    var templates,
        compileTemplate;

    //Content templates --These should be in <script> angular template blocks
    //This is a temporary solution for basic content type templates
    templates = {
        "div|text": {
            "edit": "<label>{{name}}:&nbsp;</label><input type='text' id='{{id}}' class='{{class}} contentInput' ng-model='{{model}}' value='{{content}}'/>",
            "view": "<span id='{{id}}' class='{{class}}'><label>{{name}}:&nbsp;</label>{{content}}</div>"
        },
        "div|textarea": {
            "edit": "<label>{{name}}</label><textarea id='{{id}}' class='{{class}} contentInput' ng-model='{{model}}'>{{content}}</textarea>",
            "view": "<span id='{{id}}' class='{{class}}'>{{content}}</div>"
        },        
        "hidden|text": {
            "edit": "<label>{{name}}</label><input type='text' id='{{id}}' class='{{class}} contentInput' ng-model='{{model}}' value='{{content}}'/>",
            "view": ""
        },        
        "select|ul": {
            "edit": "<ul></ul>",
            "view": "<select>{{items}}</select>"
        },
        "common": {
            "editButton": "<input type='button' value='Edit' class='editButton' style='clear:both'/>",
            "editControls": "<span><input type='button' value='Save' class='saveButton'/><input type='button' value='Cancel' class='cancelButton'/></span>",
            "editModeContainer": "<div class='content-container'><div class='content-controls'></div><div class='content-area'></div></div>"
        }
    };

    //Function to compile a template
    compileTemplate = function (itemType, itemMode, itemData) {

        //Variables
        var template, 
            key;

        //Get target template
        template = templates[itemType][itemMode];

        //Loop through supplied data and insert into template
        for (key in itemData) {

            //Check key isn't from prototype
            if (itemData.hasOwnProperty(key)) {

                template = template.replace('{{' + key + '}}', itemData[key]);

            }

        }

        //Create jQuery object from template
        template = $(template);

        //If the template is loaded in "admin" mode,
        if (itemData.editMode === true) {

            //Add container to admin controls
            var templateTemp = $(templates.common.editModeContainer);
            templateTemp.find('.content-area').append(template);
            template = templateTemp;

        }
        
        //If edit mode has been triggered
        if (itemMode === 'edit') {

            //show save and cancel buttons
            template.find('.content-controls').append($(templates.common.editControls));

        } else {

            //If admin mode is enabled, but edit mode has not been triggered
            if (itemData.editMode === true) {

                //Show button to enable edit mode
                template.find('.content-controls').append($(templates.common.editButton));

            }

        }

        //Return the compiled template
        return template;

    };

    return {

        //restrict: 'E',
        link: function postLink(scope, element, attrs) {

            //Variables
            var content = scope.content[attrs.model],
                status = 'view',
                editMode,
                template,
                disableEdit,
                enableEdit,
                startEdit,
                endEdit;

            //Create the initial view template to display based the ctContentContainer value
            element.html(compileTemplate(attrs.ctContentContainer, 'view', {
                model: attrs.model,
                content: scope.content[attrs.model],
                name: attrs.name,
                editMode: false
            }));

            
            //Change a content field from view to edit
            startEdit = function () {

                //Build template for view mode
                template = compileTemplate(attrs.ctContentContainer, 'edit', {
                    model: attrs.model,
                    content: scope.content[attrs.model],
                    name: attrs.name,
                    editMode: editMode
                });

                //Attach event handlers to edit mode controls inside the template
                template.find('.saveButton').click(function () {
                    endEdit('save');
                });

                template.find('.cancelButton').click(function () {
                    endEdit('cancel')
                });

                //Apply the template
                element.html(template);


            };

            
            //Change a content field from edit to view
            endEdit = function (closeAction) {

                //If a save flag has not been provided, or an unsupported flag has been provided
                if (closeAction === 'undefined' || (closeAction !== 'cancel' && closeAction !== 'save')) {

                    //Set action to cancel
                    closeAction = 'cancel';

                }

                //Close edit mode without saving any changes
                if (closeAction === 'cancel') {

                    //Apply the template
                    enableEdit();

                } else if (closeAction === 'save') {

                    //Save changes back to model on $scope
                    scope.$apply(function(){
                        scope.content[attrs.model] = $(element).find('.contentInput').val();
                        
                        console.log("SCOPE APPLY: " + scope.content[attrs.model]);
                    });    
                    

                    //Apply the template
                    enableEdit();

                }

            };

            //Disable edit mode / remove 'edit' buttons
            disableEdit = function (closeAction) {
                
                editMode = false;

                //Build template for view mode
                template = compileTemplate(attrs.ctContentContainer, 'view', {
                    model: attrs.model,
                    content: scope.content[attrs.model],
                    name: attrs.name,
                    editMode: editMode
                });

                //Apply the template
                element.html(template);
            };

            //Enable edit mode / add 'edit' buttons
            enableEdit = function () {

                editMode = true;

                //Build template for view mode
                template = compileTemplate(attrs.ctContentContainer, 'view', {
                    model: attrs.model,
                    content: scope.content[attrs.model],
                    name: attrs.name,
                    editMode: editMode
                });

                //Apply the click event to start editing
                template.find('.editButton').click(function () {

                    startEdit();

                });

                //Apply the template
                $(element).html($(template));

            };

            //listen for a trigger event to change the status of the element
            $rootScope.$on('ssTrigger', function (event, msg) {

                if (msg === 'hide') {

                    //Disable edit mode with save / cancel instruction
                    disableEdit('save');

                } else {

                    //Enable edit mode
                    enableEdit();

                }

            });


        }

    };

});
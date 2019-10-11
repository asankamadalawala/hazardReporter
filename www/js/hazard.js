var imagedata = null;

// Must change server value to URL of your PC
var server = '192.168.1.103:3009'

$(document).ready(function(){
    $('#btn_takepicture').tap(takePicture);
    $('#btn_submit').tap(submitHazard);
    $('#btn_clear').tap(clearAll);
    $('#refresh').tap(loadData);

    $(document).on('pageshow', '#reporthazard', function(){
        clearAll();
    });

    $(document).on('pageshow', '#home', function(){
        loadData();
    });
});

function getID(itemID){
    console.log(itemID);
    loadOneRecord(itemID);
}

function loadData(){
    $('#itemlists').empty();
    $('#itemlists').append('<li data-role="list-divider">Reported Hazard</li>');
    $.get('http://' + server + '/api/load', function(data){
        data.result.forEach(function(item){
            console.log(item);
            $('#itemlists').append('<li><a href="#view" onclick="getID(\''+item._id+'\')">'+ item.location +'</a></li>');
        });
        $("#itemlists").listview('refresh');
    });
}

function loadOneRecord(itemID){
    $('#viewlist').empty();
        $('#viewlist').append('<li data-role="list-divider">Hazard</li>');
        $.get('http://' + server + '/api/loadone/' + itemID, function(data){
            console.log(data.location);
            if(data){
                $('#viewlist').append('<li>Date: ' + data.date +'</li>');
                $('#viewlist').append('<li>Location: ' + data.location +'</li>');
                $('#viewlist').append('<li>' + data.description +'</li>');
                $('#viewlist').append('<li>' + data.critical +'</li>');
            }
            $("#view_pic").attr("src",'http://' + server + '/'+data.image);
            $("#viewlist").listview('refresh');
        });
}

function submitHazard(){
     var location = $('#location').val();
     var desc = $('#textarea-a').val();
     var choice = $("input[name='radio-mini']:checked").val();
     var errors = [];

     if(location == '') errors.push('Please enter the location.');
     if(desc == '') errors.push('Please write a description');

     if(errors.length > 0){
         errors.forEach(function(element){
             window.alert(element);
         });
     } else {
        if(imagedata == null) {
            sendDatatoServer(location, desc, choice, '');
        } else {
            var options = new FileUploadOptions();
                options.fileKey="file";
                options.fileName=imagedata.substr(imagedata.lastIndexOf("/")+1);
                options.mimeType="image/jpeg";
                options.chunkedMode = true;
            var ft = new FileTransfer()
                ft.upload(imagedata, "http://"+server+"/api/upload",
                function(r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);

                    sendDatatoServer(location, desc, choice, JSON.parse(r.response).path);
                },
                function(error) {
                    window.alert("An error has occurred: Code = "+ error.code)
                }, options);
        }
     }
}

function sendDatatoServer(location, desc, choice , imageData){
    var date = new Date();
    $.post('http://' + server + '/api/report',
    {
        location:location,
        description:desc,
        critical:choice,
        image:imageData,
        date:date,
        status:'active'
    }, function(data){
        var respond = JSON.parse(data);
        if(respond.status == true){
            window.alert(respond.msg);
            $.mobile.changePage('index.html#home');
        } else {
            window.alert(respond.msg);
        }
    });
    //            {data:JSON.stringify(arr)},
}

function takePicture(){
    navigator.camera.getPicture(cameraSuccess, function(){
        window.alert('Could not take picture');
    },  { quality: 50, destinationType: 1, sourceType: 1 });
}

function cameraSuccess(imageURI){
    imagedata=imageURI;
    $("#post_pic").attr("src",imageURI);
}

function uploadPhoto() {
    console.log(imagedata);
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imagedata.substr(imagedata.lastIndexOf("/")+1);
    options.mimeType="image/jpeg";
    options.chunkedMode = true;

    console.log(imagedata);
    console.log(options.fileName);
    console.log("http://"+server+"/api/upload");
    console.log('File transfer started..');

    var ft = new FileTransfer()
    ft.upload(imagedata, "http://"+server+"/api/upload",
        function(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
            alert(JSON.parse(r.response).path);
        },
        function(error) {
            alert("An error has occurred: Code = "+ error.code)
        }, options);
}

function clearAll(){
    cameraSuccess(null);
    $('#location').val('');
    $('#textarea-a').val('');
}
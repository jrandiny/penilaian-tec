var memberCount = 0;
var itemCount = 0;
var scoringItems;
var selecteGroup;

function addUserCard(data){
  memberCount++;


  cardHTML = `<div class="card mb-3">
    <h5 class="card-header">`+memberCount+" - "+data.name+`</h5>
    <div class="card-body">
      <div class="row">
        <div class="col-sm-4">
          <img class="mx-auto" id="profile" src="`+data.profile_picture_url+`">
        </div>
        <form class="form-inline col-sm-8 my-auto">
          `;
  var currentCat = "";
  for (i=0; i< scoringItems.length;i++){
    itemCount++;
    if(currentCat!=scoringItems[i].catName){
      cardHTML += `
      <div class="col-12">
        <h4 class="mt-3">`+scoringItems[i].catName+`</h4>
        <hr/>
        <p>`+scoringItems[i].description+`</p>

      </div>`;

      currentCat = scoringItems[i].catName;
    }
    cardHTML += `
      <div class="form-group col-8">
      <label data-toggle="tooltip" title="`+scoringItems[i].itemDesc+`" for="slider-`+itemCount+`">`+ scoringItems[i].itemName +`</label>
      <input id="slider-`+itemCount+`" data-uid="`+ data.id +`" data-item-id="`+scoringItems[i].itemId+`" type="range" class="form-control-range" min=1 max=10 value=5></input>
      </div>
      <div class="form-group col-4">
        <input type="number" class="form-control w-100 text-center" id="text-slider-`+itemCount+`" value=5>
      </div>
    `;
  }
  cardHTML +=
          `
        </form>
      </div>
    </div>`;

  $("#cardLoc").append(cardHTML);
}

function addGroupCard(value){
  cardHTML = `
  <div class="card card-select text-center">
    <div class="card-header">
      <h3 class="card-title mt-3">`+value.name+`</h3>
    </div>
    <div class="card-body">
      <span onclick="loadScoringItem(`+value.id+`)" class="mt-2 btn w-100 btn-primary">`+value.name+`</span>
    </div>
  </div>

  `;

  $("#groupDeck").append(cardHTML);
}

function loadGroupCards(){
  $.ajax({
      method: "GET",
      url: SERVER_URL+"/api/user/"+Cookies.get("uid")+"/group",
      headers: {"Authorization": "Bearer " + Cookies.get("token")}
    }).done(function( msg ) {
      if(typeof msg.error != "undefined"){
        $("#loaderAnim").hide();
        $("#loadText").html("Error : " + msg.error.text);
      }else{
        if(msg.length==0){
          $("#loadText").html("Error : Not registered in any group");
        }

        $("#cardLoc").empty();
        $("#cardLoc").append(`<div id="groupDeck" class="card-deck mx-auto"></div>`);

        $.each(msg, function( index, value ) {
          loadGroupInfo(value)
        });

        $("#loaderAnim").hide();
        $("#loadText").hide();
      }

    }).fail(function( jqXHR, textStatus ) {
      alert("Connection or server error : "+textStatus+"/"+jqXHR.statusText);
    });
}

function loadUserCards(gid){
  $.ajax({
      method: "GET",
      url: SERVER_URL+"/api/group/"+gid+"/members",
      headers: {"Authorization": "Bearer " + Cookies.get("token")}
    }).done(function( msg ) {
      if(typeof msg.error != "undefined"){
        $("#loaderAnim").hide();
        $("#loadText").html("Error : " + msg.error.text);
      }else{
        $.each(msg, function( index, value ) {
          addUserCard(value)
        });

        $("[type=range]").change(function(){
          $("#text-"+$(this).attr("id")).val($(this).val());
        });


        $("#loaderAnim").hide();
        $("#loadText").hide();
      }

    }).fail(function( jqXHR, textStatus ) {
      alert("Connection or server error : "+textStatus+"/"+jqXHR.statusText);
    });
}

function submitScore(){
  $("#submitForm div").hide();
  $("#submitButton").hide();
  $("#submitForm").append(`<div id="submitLoader" class="loader loader-small"></div>`);

  var dataScore = [];

  for(var i = 1; i<=itemCount;i++){
    var score;

    score = $("#slider-"+i).val();

    dataScore[i-1] = {};
    dataScore[i-1].score = score;
    dataScore[i-1].itemId = $("#slider-"+i).attr("data-item-id");
    dataScore[i-1].target = $("#slider-"+i).attr("data-uid");
  }

  $.ajax({
    method: "POST",
    url: BASE_URL+"/submitScore",
    data: {"scores": dataScore, "token": Cookies.get("token"),"uid":Cookies.get("uid"),"gid":selected},
    dataType: 'json'
  }).done(function( msg ) {
    if(typeof msg.status != "undefined"){
      if(msg.status == "success"){
          alert("Sukses");
          window.location.href = BASE_URL + "/";
      }else{
        alert(msg.error);
      }
    }

  }).fail(function( jqXHR, textStatus ) {
    alert("Connection or server error : "+textStatus+"/"+jqXHR.statusText);
  });
}

function loadGroupInfo(value){
  selected = value.gid;

  $.ajax({
      method: "GET",
      url: SERVER_URL+"/api/group/"+value.gid,
      headers: {"Authorization": "Bearer " + Cookies.get("token")}
    }).done(function( msg ) {
      if(typeof msg.error != "undefined"){
        $("#loaderAnim").hide();
        $("#loadText").html("Error : " + msg.error.text);
      }else{
        addGroupCard(msg);
      }

    }).fail(function( jqXHR, textStatus ) {
      alert("Connection or server error : "+textStatus+"/"+jqXHR.statusText);
    });
}

function loadScoringItem(id){
  $("#loaderAnim").show();
  $("#loadText").html("Loading");
  $("#loadText").show();

  $("#cardLoc").empty();
  $.ajax({
      method: "GET",
      url: BASE_URL+"/getScoringItem/"+id,
    }).done(function( msg ) {
      if(msg.status == "error"){
        $("#loaderAnim").hide();
        $("#loadText").html("Error : " + msg.error.text);
      }else{
        scoringItems = msg.data;
        loadUserCards(id);
      }

      $("#submitForm").show();

    }).fail(function( jqXHR, textStatus ) {
      alert("Connection or server error : "+textStatus+"/"+jqXHR.statusText);
    });
}

$( document ).ready(function() {
  reloadNavElement();
  $("#submitForm").hide();
  if(!isLoggedIn()){
    console.log("Not logged in");
    $("#loaderAnim").hide();
    $("#loadText").html("Not logged in");
  }else {
    loadGroupCards();
  }
});

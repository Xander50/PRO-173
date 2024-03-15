var uid = null
AFRAME.registerComponent("markerhandler", {
  init: async function() {
    var toys = await this.getToys();

    if(uid===null){
      this.askUserId
    }
    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(toys, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askUserId: function(){
    var iconUrl="https://raw.githubusercontent.com/whitehatjr/ar-toy-store-assets/master/toy-shop.png"
    swal({
      title:"welcome to toy shop",
      icon:iconUrl,
      content:{
        element:"input",
        attributes:{
          placeholder:"type your uid"
        }
      }
    }).then(inputValue=>{
      uid=inputValue
    })
  },
  handleMarkerFound: function(toys, markerId) {
    var toy=toys.filter(toy=>toy.id===markerId)[0]
    if(toy.is_out_of_stock){
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "this toy is out of stock",
        timer: 2000,
        buttons: false
      })
    }
    else{
    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);
    var model=model.querySelector(`#model-${toy.id}`)
    model.setAttribute("visible",true)
    }
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";

    var orderButtton = document.getElementById("order-button");
    var orderSummaryButtton = document.getElementById("order-summary-button");
    var payButton=document.getElementById("button-div")
    
    // Handling Click Events
    orderButtton.addEventListener("click", () => {
      uid=uid.toUpperCase()
      this.handleOrder(uid,toy)
      swal({
        icon: "https://i.imgur.com/4NZ6uLY.jpg",
        title: "Thanks For Order !",
        text: "  ",
        timer: 2000,
        buttons: false
      });
    });

    orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );
    payButton.addEventListener("click",()=>this.handlePayment())

    // Changing Model scale to initial scale
    var toy = toys.filter(toy => toy.id === markerId)[0];

    ratingButton.addEventListener("click", () => this.handleRatings(dish));
    
    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);
  },

  handleOrder:function(uid,toy){
    firebase.firestore().collection("users").doc(uid).get().then(doc=>{
      var details=doc.data()
      if(details["current_orders"][toy.id]){
        details["current_orders"][toy.id]["quantity"]+=1
        var currentQuantity=details["current_orders"][toy.id][quantity]
        details["current_orders"][toy.id]["subtotal"]=currentQuantity*toy.price
      }
      else{
        details["current_orders"][toy.id]={
          item:toy.toy_name,
          price:toy.price,
          quantity:1,
          subtotal:toy.price*1,
        }
      }
      details.total_bill+=toy.price
      firebase.firestore().collection("users").doc(doc.id).update(details)
    })
  },
  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },

  getOrderSummary: async function (uid) {
    return await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {

    //Getting Table Number
    var uid;
    userId <= 9 ? (uid = `T0${userId}`) : `T${userId}`;

    //Getting Order Summary from database
    var orderSummary = await this.getOrderSummary(uid);

    //Changing modal div visibility
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    //Get the table element
    var userBodyTag = document.getElementById("bill-user-body");

    //Removing old tr(table row) data
    userBodyTag.innerHTML = "";

    //Get the cuurent_orders key 
    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {

      //Create table row
      var tr = document.createElement("tr");

      //Create table cells/columns for ITEM NAME, PRICE, QUANTITY & TOTAL PRICE
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      //Add HTML content 
      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      //Append cells to the row
      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      //Append row to the table
      tableBodyTag.appendChild(tr);
    });

    var totalTr=document.createElement("tr")
    var td1=document.createElement("td")
    td1.setAttribute("class","no-line")

    var td2=document.createElement("td")
    td2.setAttribute("class","no-line")

    var td3=document.createElement("td")
    td3.setAttribute("class","no-line text-center")

    var strongTag=document.createElement("strong")
    strongTag.innerHTML="Total"

    td3.appendChild(strongTag)

    var td4=document.createElement("td")
    td1.setAttribute("class","no-line text-right")
    td4.innerHTML="$"+orderSummary.total_bill
    totalTr.appendChild(td1)
    totalTr.appendChild(td2)
    totalTr.appendChild(td3)
    totalTr.appendChild(td4)

    tableBodyTag.appendChild(totalTr)
  },
  handlePayment: function () {
    document.getElementById("modal-div").style.display="none"
    var uid;
    userId <= 9 ? (uid = `T0${userId}`) : `T${userId}`;
    firebase.firestore().collection("users").doc(uid).update({
      current_orders:{},
      total_bills:0
    })
    .then(()=>{
      swal({
        icon:"sucess",
        title:"thanks for paying",
        text:"We hope your child has fun",
        timer:2500,
        buttons:false
      })
    })
  },

  handleRatings:function(toy){
    document.getElementById("rating-modal-div").style.display="flex";
    document.getElementById("rating-input").value="0";

    var saveRatingButton = document.getElementById("save-rating-button")
    saveRatingButton.addEventListener("click", ()=>{
      document.getElementById("rating-model-div").style.display="none"
      var rating = document.getElementById("rating-input").value;

      firebase
        .firestore()
        .collection("toys")
        .doc(toy.id)
        .update({
          rating:rating
        })
        .then(()=>{
          swal({
            icon:"sucess",
            title:"Thanks For Rating!",
            text:"We Hope you Like the toy!!",
            timer:2500,
            buttons:false
          })
        })
    })
    

  }
});

// Add to cart

  $(document).ready(function () {
    $(".add-cart").click(function (event) {
      event.preventDefault();
      console.log("Ajax")
      const itemId = $(this).data("id");
      console.log(itemId)
      $.ajax({
        type: "GET",
        url: "cart/addtocart/" + itemId,
        success: function (data) {
          console.log(data)
          $("#cart-modal").modal("show");
          //alert("Item has been added to the cart!");
        },
        error: function (xhr, status, error) {
         
          alert("Adding to cart Failed")
          console.error(xhr.responseText);
        }
      });
    });
  });


//Wishlist 
  $(document).ready(function () {
    $(".add-to-wishlist").click(function (event) {
      event.preventDefault();
      console.log("add to wishlist")
      const itemId = $(this).data("id");
      $.ajax({
        type: "POST",
        url: "wishlist",
        data: { productId: itemId },
        success: function (data) {
          console.log(data)
          Toastify({
            text: "Item added to Wishlist",
            duration: 3000, // Set the duration for which the toast should be displayed (in milliseconds)
            // Enable the close button on the toast
            gravity: "center", // Display the toast at the top of the screen
            backgroundColor: "#ffff", // Set the background color of the toast
            stopOnFocus: true, // Stop the toast from automatically disappearing when it receives focus
            style: {
                top: "20px",
                left: "550px",
                width: "300px",
                height: "auto",
                color: "Green"

            }
        }).showToast();
        },
        error: function (xhr, status, error) {
            console.log(error)
            Toastify({
                text: "Please Log in ",
                duration: 3000, // Set the duration for which the toast should be displayed (in milliseconds)
                // Enable the close button on the toast
                gravity: "center", // Display the toast at the top of the screen
                backgroundColor: "#ffff", // Set the background color of the toast
                stopOnFocus: true, // Stop the toast from automatically disappearing when it receives focus
                style: {
                    top: "20px",
                    left: "550px",
                    width: "300px",
                    height: "auto",

                    color: "Red"

                }
            }).showToast();
          console.error(xhr.responseText);
        }
      });
    });
  });
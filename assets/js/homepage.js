jQuery(document).ready(function ($) {
  const $amount = $("#order_amount").hide();
  const $loader = $(".page-loader-container").hide();
  const $productContainer = $("#order_products_list");

  setInterval(function () {
    $("#master_input").focus();
  }, 1999);

  const processingOrder = { products: {}, order: null };

  $("#master_input").keypress(async function (e) {
    const keycode = e.keyCode ? e.keyCode : e.which;

    if (keycode == 13) {
      const $t = $(this);
      const search = $t.val();
      const checkProduct = search.split("_");

      if (checkProduct.length === 2 && checkProduct[0].length < 6) {
        const $qty = $(`div[data-product="${checkProduct[0]}"]`);

        const productId = checkProduct[0];

        if ($qty.length) {
          const qty = $qty.data("quantity");

          if (!processingOrder.products[productId] || processingOrder.products[productId].length !== qty) {
            if (processingOrder.products[productId] && processingOrder.products[productId].length) {
              if (processingOrder.products[productId].includes(search)) {
                toastr.warning("Product is already assigned, please scan another product.", "Invalid Product");
              } else {
                processingOrder.products[productId].push(search);
              }
            } else {
              processingOrder.products[productId] = [search];
            }
          } else if (
            processingOrder.products[productId] &&
            processingOrder.products[productId].length &&
            processingOrder.products[productId].includes(search)
          ) {
            toastr.warning("Product is already assigned, please scan another product.", "Invalid Product");
          } else if (processingOrder.products[productId] && processingOrder.products[productId].length === qty) {
            toastr.info("Item quantity exceeded.", "Quantity");
          }

          if (processingOrder.products[productId].length === qty) {
            $qty.css({ backgroundColor: "rgba(25,135,84, 0.99)" });
          }
        } else {
          $("#order_products_list").addClass("shark-it");

          setTimeout(function () {
            $("#order_products_list").removeClass("shark-it");
          }, 799);

          toastr.error("Item is not related to order.", "Irrelevant");
        }

        $t.val("").focus();
        console.log(processingOrder);
      } else if (search === "PRINT") {
        let canPrint = true;
        $("div[data-product]").each(function (i, e) {
          const $e = $(e);
          if ($e.data("product") && $e.data("quantity")) {
            if (
              !processingOrder.products[$e.data("product").toString()] ||
              processingOrder.products[$e.data("product").toString()].length !== $e.data("quantity")
            ) {
              canPrint = false;
            }
          } else {
            canPrint = false;
          }
        });

        if (canPrint) {
          console.log("Printing order:", canPrint);
          window.open("/orders/orders/print-sticker", "_blank");
          const tabResponse = await new Promise((resolve) => window.addEventListener("print-sticker-complete", resolve));
          console.log("sticker printed", tabResponse.detail);
        } else {
          $("#order_products_list").addClass("shark-it");

          setTimeout(function () {
            $("#order_products_list").removeClass("shark-it");
          }, 799);

          toastr.error("Items quantity is not completed.", "Quantity");
        }

        $t.val("").focus();
      } else if (search) {
        $t.blur();
        $loader.show();
        $productContainer.empty();
        processingOrder.products = {};
        $amount.hide().find("b").text("");

        $.post("/orders/orders/find-products", { search }, null, "json")
          .then(function (res) {
            if (res.products) {
              processingOrder.order = res.order;

              let totalItems = 0;
              res.products.forEach(function (product) {
                if (product.id < 1000000) {
                  totalItems += product.qty;
                  populateProduct(product);
                }
              });

              setTimeout(function () {
                $amount.slideDown().find("b").text(`PKR ${res.total} (Item: ${totalItems})`);
              });
            } else {
              toastr.error("Sticker do not have sufficient values.", "Invalid");
            }
          })
          .catch(function (res) {
            if (res && res.responseJSON) {
              Object.keys(res.responseJSON).forEach(function (key) {
                const error = res.responseJSON[key];
                toastr.error(error.message, error.rule.toCapitalizeAllWords());
              });
            }
          })
          .always(function () {
            // $t.focus();
            $t.val("").focus();
            $loader.hide();
          });
      }
    }
  });

  const populateProduct = function (product) {
    const thumbSplit = product.thumbnail_.split("/");
    const image = thumbSplit[thumbSplit.length - 1];
    $productContainer.append(`
      <div class="col-md-4 col-lg-3 col-xl-3 col-xxl-2">
        <div class="card mb-4 text-bg-dark">
          <img src="http://192.168.10.220/thumbs/${image}" width="280" height="495" class="card-img" alt="${product.id}" />
          <div class="card-img-overlay p-0">
            <h6 class="card-title p-1 bg-dark bg-opacity-75">${product.id} | ${product.name}</h6>

            <div
              data-placement="top"
              data-toggle="tooltip"
              title="Product Quantity"
              data-product="${product.id}"
              data-quantity="${product.qty}"
              data-video="${product.video_}"
              class="product-quantity play-video"
            >
              ${product.qty}
            </div>

            <div class="card-actions pt-1 pb-2 pe-2 text-end">
              <p class="mb-1">
                <sup>Rs:</sup>
                <b class="fs-4">${product.itemPrice}</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    `);
  };
});

jQuery.debounce = function (func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

String.prototype.toCapitalizeCase = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toCapitalizeAllWords = function () {
  let splitStr = this.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].toCapitalizeCase();
  }
  return splitStr.join(" ");
};

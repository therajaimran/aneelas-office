jQuery(document).ready(function ($) {
  const priceCheck = 1000;
  const $amount = $("#order_amount").hide();
  const $duplicate = $("#order_duplicate").hide();
  const $loader = $(".page-loader-container").hide();
  const $productContainer = $("#order_products_list");

  setInterval(function () {
    $("#master_input").focus();
  }, 1999);

  let packingStart = false;
  const processingOrder = { products: {}, order: null, printed: null };

  $("#master_input").keypress(function (e) {
    const deviceId = localStorage.getItem("device_id");
    const keycode = e.keyCode ? e.keyCode : e.which;

    if (keycode == 13) {
      const $t = $(this);
      const search = $t.val();
      const checkProduct = search.split("_");

      if (checkProduct[0] === "START") {
        $t.blur();
        $loader.show();
        $productContainer.empty();
        processingOrder.order = null;
        processingOrder.products = {};
        processingOrder.printed = null;
        $amount.hide().find("b").text("");
        $("body").removeClass("bg-danger");
        $duplicate.hide().find("b").text("");

        $.post("/orders/start-packing", { deviceId }, null, "json")
          .then(async function (order) {
            console.log("order start res:", order);

            if (order.products) {
              packingStart = true;
              populateItemsPie(order);
            } else {
              packingStart = false;
              toastr.info("Packing order not found, please fetch live orders.", "Order");
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
            $t.val("").focus();
            $loader.hide();
          });
      } else if (checkProduct[0] === "SKIP" || checkProduct[0] === "REVIEW") {
        $loader.show();
        const sticker = processingOrder.order.id;
        $.post("/orders/skip-sticker", { sticker, deviceId }, null, "json")
          .then(async function (skipSticker) {
            console.log("skip sticker res:", skipSticker);

            $productContainer.empty();
            processingOrder.order = null;
            processingOrder.products = {};
            processingOrder.printed = null;
            $amount.hide().find("b").text("");
            $("body").removeClass("bg-danger");
            $duplicate.hide().find("b").text("");

            toastr.warning("Order has been skipped successfully!", "Skipped");

            if (packingStart) {
              $t.val("START_next")
                .focus()
                .trigger($.Event("keypress", { which: 13 }));
            } else {
              $t.val("").focus();
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
            $loader.hide();
          });
      } else if (checkProduct[0] === "PRINT") {
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

        if (canPrint || processingOrder.printed) {
          const products = [];
          const sticker = processingOrder.order.id;
          Object.values(processingOrder.products).forEach((item) => {
            if (item.length) {
              item.forEach((productFull) => {
                products.push(productFull);
              });
            }
          });

          const duplicate = !!processingOrder.printed;

          $loader.show();
          $.post("/orders/confirm-sticker", { sticker, products, deviceId, duplicate }, null, "json")
            .then(async function (confirmSticker) {
              console.log("confirm sticker res:", confirmSticker);

              window.open(`/orders/orders/print-sticker/${confirmSticker.id}`, "_blank");
              const tabResponse = await new Promise((resolve) => window.addEventListener("print-sticker-complete", resolve));
              console.log("sticker printed", tabResponse.detail);

              $productContainer.empty();
              processingOrder.order = null;
              processingOrder.products = {};
              processingOrder.printed = null;
              $amount.hide().find("b").text("");
              $("body").removeClass("bg-danger");
              $duplicate.hide().find("b").text("");

              toastr.success("Order has been processed successfully!", "Sticker");

              if (packingStart) {
                $t.val("START_next")
                  .focus()
                  .trigger($.Event("keypress", { which: 13 }));
              } else {
                $t.val("").focus();
              }
            })
            .catch(function (res) {
              if (res && res.responseJSON) {
                Object.keys(res.responseJSON).forEach(function (key) {
                  const error = res.responseJSON[key];
                  toastr.error(error.message, error.rule.toCapitalizeAllWords());

                  if (error.assigned && error.assigned.length) {
                    error.assigned.forEach((itemId) => {
                      rePopulatePieChart(itemId, "100", "red");
                      delete processingOrder.products[+itemId];
                    });
                  }
                });
              }

              $("#order_products_list").addClass("shake-it");

              setTimeout(function () {
                $("#order_products_list").removeClass("shake-it");
              }, 799);

              $t.val("").focus();
            })
            .always(function () {
              $loader.hide();
            });
        } else {
          $("#order_products_list").addClass("shake-it");

          setTimeout(function () {
            $("#order_products_list").removeClass("shake-it");
          }, 799);

          toastr.error("Items quantity is not completed.", "Quantity");

          $t.val("").focus();
        }
      } else if (checkProduct.length === 2 && checkProduct[0].length < 6 && processingOrder.order !== null) {
        const $qty = $(`div[data-product="${checkProduct[0]}"]`);

        const productId = checkProduct[0];

        if ($qty.length) {
          const price = $qty.data("price");
          const qty = $qty.data("quantity");

          if (processingOrder.products[productId] && processingOrder.products[productId].length === qty) {
            toastr.info("Item quantity exceeded.", "Quantity");
          } else if (!processingOrder.products[productId] || processingOrder.products[productId].length !== qty) {
            if (processingOrder.products[productId] && processingOrder.products[productId].length) {
              if (processingOrder.products[productId].includes(search) && price > priceCheck) {
                toastr.warning("Product is already assigned, please scan another product.", "Invalid Product");
              } else if (processingOrder.products[productId].includes(search) && price < priceCheck) {
                processingOrder.products[productId].push(`${checkProduct[0]}_${randomString(4)}`);
              } else {
                processingOrder.products[productId].push(search);
              }
            } else {
              processingOrder.products[productId] = [search];
            }
          } else if (
            price > priceCheck &&
            processingOrder.products[productId] &&
            processingOrder.products[productId].length &&
            processingOrder.products[productId].includes(search)
          ) {
            toastr.warning("Product is already assigned, please scan another product.", "Invalid Product");
          } else if (
            price < priceCheck &&
            processingOrder.products[productId] &&
            processingOrder.products[productId].length &&
            processingOrder.products[productId].includes(search)
          ) {
            processingOrder.products[productId].push(`${checkProduct[0]}_${randomString(4)}`);
          }

          const percent = Math.ceil(processingOrder.products[productId].length * (100 / qty));

          rePopulatePieChart(productId, percent);
        } else {
          $("#order_products_list").addClass("shark-it");

          setTimeout(function () {
            $("#order_products_list").removeClass("shark-it");
          }, 799);

          toastr.error("Item is not related to order.", "Irrelevant");
        }

        $t.val("").focus();
        console.log(processingOrder);
      } else if (search) {
        $t.blur();
        $loader.show();
        packingStart = false;
        $productContainer.empty();
        processingOrder.order = null;
        processingOrder.products = {};
        processingOrder.printed = null;
        $amount.hide().find("b").text("");
        $("body").removeClass("bg-danger");
        $duplicate.hide().find("b").text("");

        $.post("/orders/find-products", { search }, null, "json")
          .then(function (res) {
            if (res.products) {
              populateItemsPie(res);
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

  const populateItemsPie = function (res) {
    processingOrder.printed = res.printed;
    processingOrder.order = res.order;

    let totalItems = 0;
    res.products.forEach(function (product) {
      if (product.id < 1000000) {
        totalItems += +product.qty;
        populateProduct(product, res.productRacks[product.id]);
      }
    });

    setTimeout(function () {
      $amount.slideDown().find("b").text(`PKR ${res.total} (Item: ${totalItems}) Order: ${res.order.orderId}`);

      if (res.printed) {
        $("body").addClass("bg-danger");
        $duplicate.slideDown().find("b").text(res.printed);
      }
    });
  };

  const populateProduct = function (product, rack) {
    const thumbSplit = product.thumbnail_.split("/");
    const image = thumbSplit[thumbSplit.length - 1];
    $productContainer.append(`
      <div class="col-md-4 col-lg-3 col-xl-3 col-xxl-2">
        <div class="card mb-4 text-bg-dark">
          <img src="http://192.168.10.220/thumbs/${image}" width="280" height="495" class="card-img" alt="${product.id}" />
          <div class="card-img-overlay p-0">
            <h6 class="card-title p-1 bg-dark bg-opacity-75">${product.id} | ${product.name}</h6>

            ${rack ? '<span class="bg-primary p-1 rounded ms-2">Rack: <b>' + rack.rack_name + "</b></span>" : ""}

            <div
              data-product="${product.id}"
              data-quantity="${product.qty}"
              data-price="${product.itemPrice}"
              class="product-quantity pie-chart-container-${product.id}"
            >
              <div id="pie-chart-quantity-${product.id}" class="pie-chart-quantity" data-val="0"></div>
              <span class="pie-chart-quantity-value">${product.qty}</span>
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

    setTimeout(function () {
      $(`#pie-chart-quantity-${product.id}`).progressPie({
        mode: $.fn.progressPie.Mode.GREEN,
        valueData: "val",
        strokeWidth: 0,
        size: 100,
      });
    }, 99);
  };

  const rePopulatePieChart = function (productId, percent, color = "green") {
    $(`#pie-chart-quantity-${productId}`).remove();

    setTimeout(function () {
      $(`.pie-chart-container-${productId}`).prepend(
        `<div id="pie-chart-quantity-${productId}" class="pie-chart-quantity" data-val="${percent}"></div>`,
      );

      setTimeout(function () {
        $(`#pie-chart-quantity-${productId}`).progressPie({
          mode: color === "green" ? $.fn.progressPie.Mode.GREEN : $.fn.progressPie.Mode.RED,
          valueData: "val",
          strokeWidth: 0,
          size: 100,
        });
      });
    });
  };

  let device_id = localStorage.getItem("device_id");
  if (!device_id || device_id.length < 64) {
    $.get("/orders/get-device-id", function (res) {
      device_id = localStorage.getItem("device_id");
      if (!device_id || device_id.length < 64) {
        localStorage.setItem("device_id", res.device_id);
      }
    });
  }
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

const randomString = function (length) {
  let result = "";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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

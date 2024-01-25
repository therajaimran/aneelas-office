jQuery(document).ready(function ($) {
  const $amount = $("#order_amount").hide();
  const $loader = $(".page-loader-container").hide();
  const $productContainer = $("#order_products_list");

  setInterval(function () {
    $("#master_input").focus();
  }, 1999);

  $("#master_input").keypress(function (e) {
    const keycode = e.keyCode ? e.keyCode : e.which;

    if (keycode == 13) {
      const $t = $(this);
      const search = $t.val();

      if (search) {
        $t.blur();
        $loader.show();
        $productContainer.empty();
        $amount.hide().find("b").text("");

        $.post("/orders/orders/find-products", { search }, null, "json")
          .then(function (res) {
            if (res.products) {
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

            <div class="product-quantity play-video" data-toggle="tooltip" data-placement="top" title="Product Quantity" data-video="${product.video_}">
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

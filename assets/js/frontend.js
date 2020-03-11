// phpcs:disable PEAR.Functions.FunctionCallSignature
function pakettikauppa_pickup_point_change(element) {
  var $ = jQuery;
  var data = {
    action: 'pakettikauppa_save_pickup_point_info_to_session',
    security: $("#pakettikauppa_pickup_point_update_nonce").val(),
    pickup_point_id: $(element).val()
  };

  // Ensure that the user knows that the pickup point they chose is private
  var privatePoints = $(element).data('private-points') ? $(element).data('private-points').split(';') : [];
  var chosenPoint = $(element).val();
  var chosenIsPrivate = privatePoints.indexOf(chosenPoint) > -1;
  var global = window.pakettikauppaData;

  if (chosenIsPrivate) {
    var userKnows = confirm(global.privatePickupPointConfirm);

    if (!userKnows) {
      $(element).val('__NULL__');
      return;
    }
  }

  $.post(wc_checkout_params.ajax_url, data, function (response) {
    // do nothing
  }).fail(function (e) {
    // do nothing
  });
}

function pakettikauppa_custom_pickup_point_change(element) {
  var $ = jQuery;
  var address = element.value;

  var data = {
    action: 'pakettikauppa_use_custom_address_for_pickup_point',
    security: $("#pakettikauppa_pickup_point_update_nonce").val(),
    address: address
  }

  $.post(wc_checkout_params.ajax_url, data, function (response) {
    $('body').trigger('update_checkout');
  }).fail(function (e) {
    // should probably do SOMETHING?
  });
}

/**
 * KCO compatibility.
 * Do only when customer is on KCO page (to prevent disturbance on regular checkout)
 */
if (typeof window._klarnaCheckout === 'function') {
  
  /**
   * Upon shipping method change page must reload to trigger Klarna plugins moveExtraCheckoutFields()
   * @since klarna-checkout-for-woocommerce version 2.0.0
   */
  jQuery('body').on('updated_shipping_method kco_shipping_address_changed', function () {
    window.location.reload();
    //TODO: How to prevent two selects with same name?
    // (After Klarna move the cart is reloaded, and the select field appears again)
  });
  
  /**
   * Woocommerce frontend validation doesn't validate the pickup point selection because it's loaded after document.ready,
   * and select2 isn't properly initialised on it.
   * If server-side validation fails, the iframe and cart remain blocked/suspended, and it must be manually released.
   */
  jQuery('body').on('kco_order_validation', function (event, result) {
    if (false === result) {
      jQuery(this).trigger('updated_checkout');
      
      // Highlight the failed field. (use name as selector, because there are two selects with the same ID atm)
      jQuery('select[name="pakettikauppa_pickup_point"]').css({color: 'red', fontWeight: 'bold'}).on('click', function () {
        jQuery(this).css({color: 'initial', fontWeight: 'unset'});
      });
    }
  });
  
}
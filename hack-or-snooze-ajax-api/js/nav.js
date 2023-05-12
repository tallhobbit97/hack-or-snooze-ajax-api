"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

// show submit story form on click on "submit"
function navSubmitClick(evt) {
  hidePageComponents();
  $submitForm.show();
}

$navSubmit.on("click", navSubmitClick);

// show user's favorites list on click on "favorites"
function navFavoritesClick(evt) {
  hidePageComponents();
  $favStoriesList.show();
}

$navFavs.on("click", navFavoritesClick);

/** When a user first logs in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navSubmit.show();
  $navFavs.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

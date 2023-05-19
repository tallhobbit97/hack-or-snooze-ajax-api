"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favStoriesList;
let userStoryList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  if (currentUser){
    favStoriesList = new StoryList(currentUser.favorites);
    userStoryList = new StoryList(currentUser.ownStories);
  }
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  if (currentUser){
    inidcateFavoritesOnLoad();
    $('.fav-btn-container').on('click', event => {
      favBtnHandler(event)
    });
  }
  $allStoriesList.show();
}

//takes user input from submit form, submits story data to API, creates new Story instance and displays new story on the page with other stories.
async function addNewStory(e){
  e.preventDefault();
  let title = $('#new-story-title').val();
  let author = $('#new-story-author').val();
  let url = $('#new-story-url').val();
  const story = {
    title,
    author,
    url
  }
  const newStory = await storyList.addStory(currentUser, story);
  storyList.stories.unshift(newStory);
  $submitForm.trigger('reset');
  hidePageComponents();
  putStoriesOnPage();
}
$submitForm.on('submit', e => addNewStory(e));

//adds/removes stories from user's favorites list and updates UI accordingly
async function favBtnHandler(event){
  const target = $(event.target);
  const classList = target.attr("class").split(/\s+/);
  if (classList.includes('not-favorite')){
    target.removeClass('not-favorite').addClass('favorite');
    let storyId = target.parent().attr('id');
    await currentUser.addFavorite(storyId);
  } else {
    target.removeClass('favorite').addClass('not-favorite');
    let storyId = target.parent().attr('id');
    await currentUser.removeFavorite(storyId);
  }
}

//goes through storyList.stories and checks to see which stories are on the user's favorites list and updates UI accordingly
function inidcateFavoritesOnLoad(){
  console.debug('indicateFavoritesOnLoad');
  let favoriteIds = currentUser.favorites.map(fav => {
    return fav.storyId;
  });
  for (let story of storyList.stories) {
    if (favoriteIds.includes(story.storyId)){
      $(`#${story.storyId}`).prepend('<div class="fav-btn-container favorite"></div>')
    } else {
      $(`#${story.storyId}`).prepend('<div class="fav-btn-container not-favorite"></div>')
    }
  }
}

//adds content to $favStoriesList so that it can be shown when needed
async function createFavStories(){
  $favStoriesList.empty();
  let favs = await favStoriesList.stories;
  for (let story of favs) {
    const $story = generateStoryMarkup(story);
    $favStoriesList.append($story);
    $(`#fav-stories-list #${story.storyId}`).prepend('<div class="fav-btn-container favorite"></div>');
  }
  $('#fav-stories-list .fav-btn-container').on('click', event => {
    favBtnHandler(event);
  });
}

async function createUserStories(){
  $userStoriesList.empty();
  let userStories = await userStoryList.stories;
  for (let story of userStories){
    const $story = generateStoryMarkup(story);
    $userStoriesList.append($story);
    $(`#user-stories-list #${story.storyId}`).prepend('<div class="remove-btn-container remove"></div>');
  }
  $('.remove-btn-container').on('click', evt => removeUserStory(evt));
}

async function removeUserStory(event){
  const target = $(event.target);
  let storyId = target.parent().attr('id');
  storyList.removeStory(storyId);
  target.parent().hide();
}
import { browser, ExpectedConditions as ec, promise } from 'protractor';
import { NavBarPage, SignInPage } from '../../page-objects/jhi-page-objects';

import { TagComponentsPage, TagDeleteDialog, TagUpdatePage } from './tag.page-object';

const expect = chai.expect;

describe('Tag e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let tagComponentsPage: TagComponentsPage;
  let tagUpdatePage: TagUpdatePage;
  let tagDeleteDialog: TagDeleteDialog;
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.autoSignInUsing(username, password);
    await browser.wait(ec.visibilityOf(navBarPage.entityMenu), 5000);
  });

  it('should load Tags', async () => {
    await navBarPage.goToEntity('tag');
    tagComponentsPage = new TagComponentsPage();
    await browser.wait(ec.visibilityOf(tagComponentsPage.title), 5000);
    expect(await tagComponentsPage.getTitle()).to.eq('Tags');
    await browser.wait(ec.or(ec.visibilityOf(tagComponentsPage.entities), ec.visibilityOf(tagComponentsPage.noResult)), 1000);
  });

  it('should load create Tag page', async () => {
    await tagComponentsPage.clickOnCreateButton();
    tagUpdatePage = new TagUpdatePage();
    expect(await tagUpdatePage.getPageTitle()).to.eq('Create or edit a Tag');
    await tagUpdatePage.cancel();
  });

  it('should create and save Tags', async () => {
    const nbButtonsBeforeCreate = await tagComponentsPage.countDeleteButtons();

    await tagComponentsPage.clickOnCreateButton();

    await promise.all([tagUpdatePage.setNameInput('name')]);

    expect(await tagUpdatePage.getNameInput()).to.eq('name', 'Expected Name value to be equals to name');

    await tagUpdatePage.save();
    expect(await tagUpdatePage.getSaveButton().isPresent(), 'Expected save button disappear').to.be.false;

    expect(await tagComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1, 'Expected one more entry in the table');
  });

  it('should delete last Tag', async () => {
    const nbButtonsBeforeDelete = await tagComponentsPage.countDeleteButtons();
    await tagComponentsPage.clickOnLastDeleteButton();

    tagDeleteDialog = new TagDeleteDialog();
    expect(await tagDeleteDialog.getDialogTitle()).to.eq('Are you sure you want to delete this Tag?');
    await tagDeleteDialog.clickOnConfirmButton();
    await browser.wait(ec.visibilityOf(tagComponentsPage.title), 5000);

    expect(await tagComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});

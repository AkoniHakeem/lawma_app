import { boot } from 'quasar/wrappers';
import { BaseModel } from 'src/models/base.model';
import { getHighestZIndex, validateField } from 'src/lib/utils';
import getColor from 'src/plugins/getColor';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $getColor: (colorAlias: string) => string | null;
    $validateField: (model: BaseModel, name: string) => string | boolean;
    $getHighestZIndex: () => number;
  }
}
export default boot(({ app }) => {
  // app.config.globalProperties.$getColor = (colorAlias: string) => {
  //   console.log('get color was called');
  //   return getCssVar(colorAlias);
  // };
  // router.beforeEach((to, from, next) => {
  //   console.log('this is the current route: ', to.path);
  //   next(() => {
  //     window.history.pushState(null, '', to.path);
  //     window.onpopstate = () => {
  //       next({ path: from.path, replace: true });
  //     };
  //   });
  // });

  app.config.globalProperties.$validateField = validateField;
  app.config.globalProperties.$getHighestZIndex = getHighestZIndex;
  // register plugins
  app.use(getColor);
});

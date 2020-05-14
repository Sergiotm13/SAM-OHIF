import React, { useContext, useEffect, useCallback } from 'react';
import { displaySetManager, ToolBarManager } from '@ohif/core';
import { useViewModel } from '@ohif/core';
import Compose from './Compose';
import ViewportGrid from './../components/ViewportGrid.jsx';

export default function ModeRoute({
  location,
  mode,
  dataSourceName,
  extensionManager,
}) {
  const { routes, sopClassHandlers, extensions } = mode;
  const dataSources = extensionManager.getDataSources(dataSourceName);

  // Add toolbar state to the view model context?
  const {
    toolBarLayout,
    setToolBarLayout,
    displaySetInstanceUids,
    setDisplaySetInstanceUids,
  } = useViewModel();

  // TODO: For now assume one unique datasource.

  const dataSource = dataSources[0];
  const route = routes[0];

  let toolBarManager;

  useEffect(() => {
    toolBarManager = new ToolBarManager(extensionManager, setToolBarLayout);
    route.init({ toolBarManager });
  }, [mode, dataSourceName, location]);

  console.log(dataSource);

  const createDisplaySets = useCallback(() => {
    // Add SOPClassHandlers to a new SOPClassManager.
    displaySetManager.init(extensionManager, sopClassHandlers, {
      displaySetInstanceUids,
      setDisplaySetInstanceUids,
    });

    const queryParams = location.search;

    // Call the data source to start building the view model?
    dataSource.retrieve.series.metadata(
      queryParams,
      displaySetManager.makeDisplaySets
    );
  }, [displaySetInstanceUids, location]);

  useEffect(() => {
    createDisplaySets();
  }, [mode, dataSourceName, location]);

  // Only handling one route per mode for now
  // You can test via http://localhost:3000/example-mode/dicomweb
  const layoutTemplateData = route.layoutTemplate({ location });
  const layoutTemplateModuleEntry = extensionManager.getModuleEntry(
    layoutTemplateData.id
  );
  const LayoutComponent = layoutTemplateModuleEntry.component;

  // For each extension, look up their context modules
  // TODO: move to extension manager.
  let contextModules = [];
  extensions.forEach(extensionId => {
    const allRegisteredModuleIds = Object.keys(extensionManager.modulesMap);
    const moduleIds = allRegisteredModuleIds.filter(id =>
      id.includes(`${extensionId}.contextModule.`)
    );

    if (!moduleIds || !moduleIds.length) {
      return;
    }

    const modules = moduleIds.map(extensionManager.getModuleEntry);
    contextModules = contextModules.concat(modules);
  });

  const contextModuleProviders = contextModules.map(a => a.provider);
  const CombinedContextProvider = ({ children }) =>
    Compose({ components: contextModuleProviders, children });

  return (
    <CombinedContextProvider>
      {/* TODO: extensionManager is already provided to the extension module.
       *  Use it from there instead of passing as a prop here.
       */}
      <LayoutComponent
        extensionManager={extensionManager}
        displaySetInstanceUids={displaySetInstanceUids}
        toolBarLayout={toolBarLayout}
        ViewportGrid={ViewportGrid}
        {...layoutTemplateData.props}
      />
    </CombinedContextProvider>
  );
}

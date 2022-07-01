import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { isServer } from '@growi/core';
import dynamic from 'next/dynamic';

import { useUserUISettings } from '~/client/services/user-ui-settings';
import {
  useDrawerMode, useDrawerOpened,
  useSidebarCollapsed,
  useCurrentSidebarContents,
  useCurrentProductNavWidth,
  useSidebarResizeDisabled,
  useSidebarScrollerRef,
} from '~/stores/ui';

import DrawerToggler from './Navbar/DrawerToggler';
import { NavigationResizeHexagon } from './Sidebar/NavigationResizeHexagon';
import SidebarContents from './Sidebar/SidebarContents';
import { SidebarNavSkeleton } from './Sidebar/SidebarNav';
import { StickyStretchableScroller } from './StickyStretchableScroller';

import './Sidebar.scss';


const sidebarMinWidth = 240;
const sidebarMinimizeWidth = 20;
const sidebarFixedWidthInDrawerMode = 320;


const GlobalNavigation = () => {
  const SidebarNav = dynamic(() => import('./Sidebar/SidebarNav').then(mod => mod.SidebarNav), { ssr: false });
  const { data: isDrawerMode } = useDrawerMode();
  const { data: currentContents } = useCurrentSidebarContents();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();

  const { scheduleToPut } = useUserUISettings();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isServer()) return;
    setIsLoaded(true);
  });
  const itemSelectedHandler = useCallback((selectedContents) => {
    if (isDrawerMode) {
      return;
    }

    let newValue = false;

    // already selected
    if (currentContents === selectedContents) {
      // toggle collapsed
      newValue = !isCollapsed;
    }

    mutateSidebarCollapsed(newValue, false);
    scheduleToPut({ isSidebarCollapsed: newValue });

  }, [currentContents, isCollapsed, isDrawerMode, mutateSidebarCollapsed, scheduleToPut]);

  return isLoaded
    ? <SidebarNav onItemSelected={itemSelectedHandler} />
    : <SidebarNavSkeleton/>;
};

// const SidebarContentsWrapper = () => {
//   const { mutate: mutateSidebarScroller } = useSidebarScrollerRef();

//   const calcViewHeight = useCallback(() => {
//     const elem = document.querySelector('#grw-sidebar-contents-wrapper');
//     return elem != null
//       ? window.innerHeight - elem?.getBoundingClientRect().top
//       : window.innerHeight;
//   }, []);

//   return (
//     <>
//       <div id="grw-sidebar-contents-wrapper" style={{ minHeight: '100%' }}>
//         <StickyStretchableScroller
//           simplebarRef={mutateSidebarScroller}
//           stickyElemSelector=".grw-sidebar"
//           calcViewHeight={calcViewHeight}
//         >
//           <SidebarContents />
//         </StickyStretchableScroller>
//       </div>

//       <DrawerToggler iconClass="icon-arrow-left" />
//     </>
//   );
// };


const Sidebar = (): JSX.Element => {
  // const { data: isDrawerMode } = useDrawerMode(); Todo Universalize
  const isDrawerMode = false; // dummy
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: currentProductNavWidth, mutate: mutateProductNavWidth } = useCurrentProductNavWidth();
  const { data: isCollapsed, mutate: mutateSidebarCollapsed } = useSidebarCollapsed();
  const { data: isResizeDisabled, mutate: mutateSidebarResizeDisabled } = useSidebarResizeDisabled();

  const { scheduleToPut } = useUserUISettings();

  const [isTransitionEnabled, setTransitionEnabled] = useState(false);

  const [isHover, setHover] = useState(false);
  const [isHoverOnResizableContainer, setHoverOnResizableContainer] = useState(false);
  const [isDragging, setDrag] = useState(false);

  const resizableContainer = useRef<HTMLDivElement>(null);

  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const isResizableByDrag = !isResizeDisabled && !isDrawerMode && (!isCollapsed || isHover);

  const toggleDrawerMode = useCallback((bool) => {
    const isStateModified = isResizeDisabled !== bool;
    if (!isStateModified) {
      return;
    }

    // Drawer <-- Dock
    if (bool) {
      // disable resize
      mutateSidebarResizeDisabled(true, false);
    }
    // Drawer --> Dock
    else {
      // enable resize
      mutateSidebarResizeDisabled(false, false);
    }
  }, [isResizeDisabled, mutateSidebarResizeDisabled]);

  const backdropClickedHandler = useCallback(() => {
    mutateDrawerOpened(false, false);
  }, [mutateDrawerOpened]);


  const setContentWidth = useCallback((newWidth: number) => {
    if (resizableContainer.current == null) {
      return;
    }
    resizableContainer.current.style.width = `${newWidth}px`;
  }, []);

  const hoverOnHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(true);
  }, [isCollapsed, isDragging, isDrawerMode]);

  const hoverOutHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHover(false);
  }, [isCollapsed, isDragging, isDrawerMode]);

  const hoverOnResizableContainerHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHoverOnResizableContainer(true);
  }, [isCollapsed, isDrawerMode, isDragging]);

  const hoverOutResizableContainerHandler = useCallback(() => {
    if (!isCollapsed || isDrawerMode || isDragging) {
      return;
    }

    setHoverOnResizableContainer(false);
  }, [isCollapsed, isDrawerMode, isDragging]);

  const toggleNavigationBtnClickHandler = useCallback(() => {
    const newValue = !isCollapsed;
    mutateSidebarCollapsed(newValue, false);
    scheduleToPut({ isSidebarCollapsed: newValue });
  }, [isCollapsed, mutateSidebarCollapsed, scheduleToPut]);

  useEffect(() => {
    if (isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setContentWidth(currentProductNavWidth!);
    }
  }, [currentProductNavWidth, isCollapsed, setContentWidth]);

  const draggableAreaMoveHandler = useCallback((event: MouseEvent) => {
    event.preventDefault();

    const newWidth = event.pageX - 60;
    if (resizableContainer.current != null) {
      setContentWidth(newWidth);
      resizableContainer.current.classList.add('dragging');
    }
  }, [setContentWidth]);

  const dragableAreaMouseUpHandler = useCallback(() => {
    if (resizableContainer.current == null) {
      return;
    }

    setDrag(false);

    if (resizableContainer.current.clientWidth < sidebarMinWidth) {
      // force collapsed
      mutateSidebarCollapsed(true);
      mutateProductNavWidth(sidebarMinWidth, false);
      scheduleToPut({ isSidebarCollapsed: true, currentProductNavWidth: sidebarMinWidth });
    }
    else {
      const newWidth = resizableContainer.current.clientWidth;
      mutateSidebarCollapsed(false);
      mutateProductNavWidth(newWidth, false);
      scheduleToPut({ isSidebarCollapsed: false, currentProductNavWidth: newWidth });
    }

    resizableContainer.current.classList.remove('dragging');

  }, [mutateProductNavWidth, mutateSidebarCollapsed, scheduleToPut]);

  const dragableAreaMouseDownHandler = useCallback((event: React.MouseEvent) => {
    if (!isResizableByDrag) {
      return;
    }

    event.preventDefault();

    setDrag(true);

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', draggableAreaMoveHandler);
      document.removeEventListener('mouseup', dragableAreaMouseUpHandler);
      document.removeEventListener('mouseup', removeEventListeners);
    };

    document.addEventListener('mousemove', draggableAreaMoveHandler);
    document.addEventListener('mouseup', dragableAreaMouseUpHandler);
    document.addEventListener('mouseup', removeEventListeners);

  }, [dragableAreaMouseUpHandler, draggableAreaMoveHandler, isResizableByDrag]);

  useEffect(() => {
    setTimeout(() => {
      setTransitionEnabled(true);
    }, 1000);
  }, []);

  useEffect(() => {
    toggleDrawerMode(isDrawerMode);
  }, [isDrawerMode, toggleDrawerMode]);

  // open/close resizable container
  useEffect(() => {
    if (!isCollapsed) {
      return;
    }

    if (isHoverOnResizableContainer) {
      // schedule to open
      timeoutIdRef.current = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setContentWidth(currentProductNavWidth!);
      }, 70);
    }
    else if (timeoutIdRef.current != null) {
      // cancel schedule to open
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
    }

    // close
    if (!isHover) {
      setContentWidth(sidebarMinimizeWidth);
      timeoutIdRef.current = undefined;
    }
  }, [isCollapsed, isHover, isHoverOnResizableContainer, currentProductNavWidth, setContentWidth]);

  // open/close resizable container when drawer mode
  useEffect(() => {
    if (isDrawerMode) {
      setContentWidth(sidebarFixedWidthInDrawerMode);
    }
    else if (isCollapsed) {
      setContentWidth(sidebarMinimizeWidth);
    }
    else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setContentWidth(currentProductNavWidth!);
    }
  }, [currentProductNavWidth, isCollapsed, isDrawerMode, setContentWidth]);


  const showContents = isDrawerMode || isHover || !isCollapsed;

  return (
    <>
      <div className={`grw-sidebar d-print-none ${isDrawerMode ? 'grw-sidebar-drawer' : ''} ${isDrawerOpened ? 'open' : ''}`}>
        <div className="data-layout-container">
          <div
            className={`navigation ${isTransitionEnabled ? 'transition-enabled' : ''}`}
            onMouseEnter={hoverOnHandler}
            onMouseLeave={hoverOutHandler}
          >
            <div className="grw-navigation-wrap">
              <div className="grw-global-navigation">
                <GlobalNavigation></GlobalNavigation>
              </div>
              <div
                ref={resizableContainer}
                className="grw-contextual-navigation"
                onMouseEnter={hoverOnResizableContainerHandler}
                onMouseLeave={hoverOutResizableContainerHandler}
                style={{ width: isCollapsed ? sidebarMinimizeWidth : currentProductNavWidth }}
              >
                <div className="grw-contextual-navigation-child">
                  <div role="group" data-testid="grw-contextual-navigation-sub" className={`grw-contextual-navigation-sub ${showContents ? '' : 'd-none'}`}>
                    {/* <SidebarContentsWrapper></SidebarContentsWrapper> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="grw-navigation-draggable">
              { isResizableByDrag && (
                <div
                  className="grw-navigation-draggable-hitarea"
                  onMouseDown={dragableAreaMouseDownHandler}
                >
                  <div className="grw-navigation-draggable-hitarea-child"></div>
                </div>
              ) }
              <button
                data-testid="grw-navigation-resize-button"
                className={`grw-navigation-resize-button ${!isDrawerMode ? 'resizable' : ''} ${isCollapsed ? 'collapsed' : ''} `}
                type="button"
                aria-expanded="true"
                aria-label="Toggle navigation"
                disabled={isDrawerMode}
                onClick={toggleNavigationBtnClickHandler}
              >
                <span className="hexagon-container" role="presentation">
                  {/* <NavigationResizeHexagon /> */}
                </span>
                <span className="hitarea" role="presentation"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      { isDrawerOpened && (
        <div className="grw-sidebar-backdrop modal-backdrop show" onClick={backdropClickedHandler}></div>
      ) }
    </>
  );

};

export default Sidebar;

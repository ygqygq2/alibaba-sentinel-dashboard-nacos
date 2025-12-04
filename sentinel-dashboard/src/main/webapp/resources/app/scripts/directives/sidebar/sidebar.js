angular.module("sentinelDashboardApp").directive("sidebar", [
  "$location",
  "$stateParams",
  "AppService",
  "$document",
  function () {
    return {
      templateUrl: "app/scripts/directives/sidebar/sidebar.html",
      restrict: "E",
      replace: true,
      scope: {},
      controller: function ($scope, $stateParams, $location, AppService, $document) {
        $scope.app = $stateParams.app;
        $scope.collapseVar = 0;

        // 可调整宽度功能
        const MIN_WIDTH = 180;
        const MAX_WIDTH = 400;
        const DEFAULT_WIDTH = 220;
        const STORAGE_KEY = "sentinel_sidebar_width";

        // 从 localStorage 恢复宽度
        let savedWidth = localStorage.getItem(STORAGE_KEY);
        $scope.sidebarWidth = savedWidth ? parseInt(savedWidth) : DEFAULT_WIDTH;

        // 更新主内容区域的 margin
        function updatePageWrapper() {
          let pageWrapper = document.getElementById("page-wrapper");
          if (pageWrapper) {
            pageWrapper.style.marginLeft = $scope.sidebarWidth + "px";
          }
        }
        updatePageWrapper();

        let isResizing = false;

        $scope.startResize = function (event) {
          isResizing = true;
          event.preventDefault();

          $document.on("mousemove", doResize);
          $document.on("mouseup", stopResize);
        };

        function doResize(event) {
          if (!isResizing) return;

          let newWidth = event.clientX;
          if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
          if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

          $scope.$apply(function () {
            $scope.sidebarWidth = newWidth;
          });
          updatePageWrapper();
        }

        function stopResize() {
          if (isResizing) {
            isResizing = false;
            localStorage.setItem(STORAGE_KEY, $scope.sidebarWidth);
            $document.off("mousemove", doResize);
            $document.off("mouseup", stopResize);
          }
        }

        // app
        AppService.getApps().success(function (data) {
          if (data.code === 0) {
            let path = $location.path().split("/");
            let initHashApp = path[path.length - 1];
            $scope.apps = data.data;
            $scope.apps = $scope.apps.map(function (item) {
              if (item.app === initHashApp) {
                item.active = true;
              }
              let healthyCount = 0;
              for (let i in item.machines) {
                if (item.machines[i].healthy) {
                  healthyCount++;
                }
              }
              item.healthyCount = healthyCount;
              // Handle appType
              item.isGateway = item.appType === 1 || item.appType === 11 || item.appType === 12;

              if (item.shown) {
                return item;
              }
            });
          }
        });

        // toggle side bar
        $scope.click = function ($event) {
          let entry = angular.element($event.target).scope().entry;
          entry.active = !entry.active; // toggle this clicked app bar

          $scope.apps.forEach(function (item) {
            // collapse other app bars
            if (item !== entry) {
              item.active = false;
            }
          });
        };

        /**
         * @deprecated
         */
        $scope.addSearchApp = function () {
          let findApp = false;
          for (let i = 0; i < $scope.apps.length; i++) {
            if ($scope.apps[i].app === $scope.searchApp) {
              findApp = true;
              break;
            }
          }
          if (!findApp) {
            $scope.apps.push({ app: $scope.searchApp });
          }
        };
      },
    };
  },
]);

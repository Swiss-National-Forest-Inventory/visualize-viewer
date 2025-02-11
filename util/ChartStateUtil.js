import {LINDAS_ENDPOINT} from '../config.js';
import {getColor} from './shared.js';

/***
 * An object containing various functions to build chart configurations (for both
 * chart and map visualizations) as well as utilities for grouping and region filtering.
 */
export const chartState = {
  /**
   * Generates a configuration object for a column chart visualization based on the
   * current viewer state and the specified filters.
   *
   * @function chart
   * @param {Object} lfiViewer - An object containing services like propertyService,
   *   visualizationService, regionService, etc.
   * @param {Object} filters - A mapping of filter keys to objects, each containing
   *   a `dimPath` and `value`.
   * @returns {Object} The configuration object for creating a column chart.
   */
  chart: function(lfiViewer, filters) {
    const filterObj = {};
    Object.keys(filters).map((filterName) => {
      if (filterName === 'https://environment.ld.admin.ch/foen/nfi/classificationUnit') {
        if (lfiViewer.visualizationService.groupedClassification) {
          const values = {};
          lfiViewer.propertyService.classificationDimensions.forEach((element, index) => {
            if (element !== "https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total") {
              values[element] = true;
            }
          });
          filterObj[filters[filterName].dimPath.value] = {
            type: 'multi',
            values: values,
          };
        } else {
          filterObj[filters[filterName].dimPath.value] = {
            type: 'single',
            value: filters[filterName].value.value,
          };
        }
      } else {
        filterObj[filters[filterName].dimPath.value] = {
          type: 'single',
          value: filters[filterName].value.value,
        };
      }
    });

    filterObj['https://environment.ld.admin.ch/foen/nfi/unitOfReference'] =
        chartState.regionFilter(
            lfiViewer,
            lfiViewer.visualizationService.groupedRegion,
        );

    return {
      version: '4.0.0',
      state: 'CONFIGURING_CHART',
      dataSource: {
        type: 'sparql',
        url: `${LINDAS_ENDPOINT}`,
      },
      layout: {
        type: 'tab',
        meta: {
          title: {
            de: '',
            en: '',
            fr: '',
            it: '',
          },
          description: {
            de: '',
            en: '',
            fr: '',
            it: '',
          },
          label: {
            de: "",
            en: "",
            fr: "",
            it: ""
          }
        },
      },
      chartConfigs: [
        {
          key: 'zTuhSfYsiB7W',
          version: '3.2.0',
          meta: {
            title: {
              en: '',
              de: '',
              fr: '',
              it: '',
            },
            description: {
              en: '',
              de: '',
              fr: '',
              it: '',
            },
            label: {
              en: "",
              de: "",
              fr: "",
              it: ""
            }
          },
          cubes: [
            {
              iri: lfiViewer.propertyService.cube,
              publishIri: lfiViewer.propertyService.cube,
              filters: filterObj,
            },
          ],
          chartType: 'column',
          interactiveFiltersConfig: {
            legend: {
              active: false,
              componentIri: '',
            },
            timeRange: {
              active: false,
              componentIri:
                  'https://environment.ld.admin.ch/foen/nfi/inventory',
              presets: {
                type: 'range',
                from: '',
                to: '',
              },
            },
            dataFilters: {
              active: false,
              componentIris: [],
            },
            calculation: {
              active: false,
              type: 'identity',
            },
          },
          fields: {
            x: {
              componentIri:
                  'https://environment.ld.admin.ch/foen/nfi/inventory',
              sorting: {
                sortingType: 'byAuto',
                sortingOrder: 'asc',
              },
            },
            y: {
              componentIri: lfiViewer.propertyService.yAxis,
            },
            ...(lfiViewer.visualizationService.groupedRegion && chartState.groupedRegion()),
            ...(lfiViewer.visualizationService.groupedClassification && chartState.groupedClassification(lfiViewer))
          },
        },
      ],
      activeChartKey: 'zTuhSfYsiB7W',
    };
  },

  /**
   * Generates a configuration object for a map visualization based on the
   * current viewer state and the specified filters.
   *
   * @function map
   * @param {Object} lfiViewer - An object containing services like propertyService,
   *   visualizationService, regionService, etc.
   * @param {Object} filters - A mapping of filter keys to objects, each containing
   *   a `dimPath` and `value`.
   * @returns {Object} The configuration object for creating a map visualization.
   */
  map: function(lfiViewer, filters) {
    const regionValues = {};

    lfiViewer.regionService.regions[lfiViewer.regionService.selectedRegionType].forEach(
        (region) => (regionValues[region.value.value] = true),
    );

    const filterObj = {};
    filterObj['https://environment.ld.admin.ch/foen/nfi/unitOfReference'] =
        chartState.regionFilter(lfiViewer, true);

    Object.keys(filters).map((filterName) => {
      filterObj[filters[filterName].dimPath.value] = {
        type: 'single',
        value: filters[filterName].value.value,
      };
    });

    return {
      version: '3.4.0',
      state: 'CONFIGURING_CHART',
      dataSource: {
        type: 'sparql',
        url: `${LINDAS_ENDPOINT}`,
      },
      layout: {
        type: 'tab',
        meta: {
          title: {
            de: '',
            en: '',
            fr: '',
            it: '',
          },
          description: {
            de: '',
            en: '',
            fr: '',
            it: '',
          },
        },
      },
      chartConfigs: [
        {
          key: 'jEASF-9qEqaC',
          version: '3.3.0',
          meta: {
            title: {
              en: '',
              de: '',
              fr: '',
              it: '',
            },
            description: {
              en: '',
              de: '',
              fr: '',
              it: '',
            },
          },
          cubes: [
            {
              iri: lfiViewer.propertyService.cube,
              publishIri: lfiViewer.propertyService.cube,
              filters: filterObj,
            },
          ],
          activeField: 'animation',
          chartType: 'map',
          interactiveFiltersConfig: {
            legend: {
              active: false,
              componentIri: '',
            },
            timeRange: {
              active: false,
              componentIri:
                  'https://environment.ld.admin.ch/foen/nfi/inventory',
              presets: {
                type: 'range',
                from: '',
                to: '',
              },
            },
            dataFilters: {
              active: false,
              componentIris: [],
            },
            calculation: {
              active: false,
              type: 'identity',
            },
          },
          baseLayer: {
            show: true,
            locked: false,
          },
          fields: {
            areaLayer: {
              componentIri:
                  'https://environment.ld.admin.ch/foen/nfi/unitOfReference',
              color: {
                type: 'numerical',
                componentIri: lfiViewer.propertyService.yAxis,
                palette: 'oranges',
                scaleType: 'continuous',
                interpolationType: 'linear',
                opacity: 100,
              },
            },
            animation: {
              componentIri:
                  'https://environment.ld.admin.ch/foen/nfi/inventory',
              showPlayButton: true,
              duration: 10,
              type: 'stepped',
              dynamicScales: false,
            },
          },
        },
      ],
      activeChartKey: 'jEASF-9qEqaC',
      dashboardFilters: {
        filters: [],
      },
    };
  },

  /**
   * Returns a configuration object to enable 'grouped' visualization.
   * Primarily configures a 'segment' field for categorizing data by
   * 'unitOfReference' with associated color mappings.
   *
   * @function groupedRegion
   * @returns {Object} A partial fields configuration object used by chart visualizations.
   */
  groupedRegion: function() {
    return {
      segment: {
        componentIri:
            'https://environment.ld.admin.ch/foen/nfi/unitOfReference',
        palette: 'category10',
        sorting: {
          sortingType: 'byAuto',
          sortingOrder: 'asc',
        },
        colorMapping: {
          'https://ld.admin.ch/canton/1': '#1f77b4',
          'https://ld.admin.ch/canton/10': '#ff7f0e',
          'https://ld.admin.ch/canton/11': '#2ca02c',
          'https://ld.admin.ch/canton/14': '#d62728',
          'https://ld.admin.ch/canton/15': '#9467bd',
          'https://ld.admin.ch/canton/16': '#8c564b',
          'https://ld.admin.ch/canton/17': '#e377c2',
          'https://ld.admin.ch/canton/18': '#7f7f7f',
          'https://ld.admin.ch/canton/19': '#bcbd22',
          'https://ld.admin.ch/canton/2': '#17becf',
          'https://ld.admin.ch/canton/20': '#1f77b4',
          'https://ld.admin.ch/canton/21': '#ff7f0e',
          'https://ld.admin.ch/canton/22': '#2ca02c',
          'https://ld.admin.ch/canton/23': '#d62728',
          'https://ld.admin.ch/canton/24': '#9467bd',
          'https://ld.admin.ch/canton/25': '#8c564b',
          'https://ld.admin.ch/canton/26': '#e377c2',
          'https://ld.admin.ch/canton/3': '#7f7f7f',
          'https://ld.admin.ch/canton/4': '#bcbd22',
          'https://ld.admin.ch/canton/5': '#17becf',
          'https://ld.admin.ch/canton/6': '#1f77b4',
          'https://ld.admin.ch/canton/7': '#ff7f0e',
          'https://ld.admin.ch/canton/8': '#2ca02c',
          'https://ld.admin.ch/canton/9': '#d62728',
          'https://ld.admin.ch/country/CHE': '#9467bd',
          'https://ld.admin.ch/dimension/bgdi/biota/cantonregions/13': '#8c564b',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/1': '#e377c2',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/10': '#7f7f7f',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/11': '#bcbd22',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/12': '#17becf',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/13': '#1f77b4',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/14': '#ff7f0e',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/2': '#2ca02c',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/3': '#d62728',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/4': '#9467bd',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/5': '#8c564b',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/6': '#e377c2',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/7': '#7f7f7f',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/8': '#bcbd22',
          'https://ld.admin.ch/dimension/bgdi/biota/economicregions/9': '#17becf',
          'https://ld.admin.ch/dimension/bgdi/biota/productionregions/1': '#1f77b4',
          'https://ld.admin.ch/dimension/bgdi/biota/productionregions/2': '#ff7f0e',
          'https://ld.admin.ch/dimension/bgdi/biota/productionregions/3': '#2ca02c',
          'https://ld.admin.ch/dimension/bgdi/biota/productionregions/4': '#d62728',
          'https://ld.admin.ch/dimension/bgdi/biota/productionregions/5': '#9467bd',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/1': '#8c564b',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/2': '#e377c2',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/3': '#7f7f7f',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/4': '#bcbd22',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/5': '#17becf',
          'https://ld.admin.ch/dimension/bgdi/biota/protectionforestregions/6': '#1f77b4',
        },
        type: 'grouped',
        useAbbreviations: true,
      },
    };
  },

  /**
   * Generates a grouped classification configuration for visualization purposes.
   *
   * This function creates a classification configuration using properties from the provided
   * `lfiViewer` object. It maps classification dimensions to specific colors, constructs
   * a unique component ID from the cube IRI, and returns an object defining the configuration for a stacked
   * segment visualization.
   *
   * @function
   * @param {Object} lfiViewer - Viewer object containing property service details.
   * @param {Object} lfiViewer.propertyService - Object containing properties used to configure the classification.
   * @param {Array<string>} lfiViewer.propertyService.classificationDimensions - Array of classification dimension names.
   * @param {string} lfiViewer.propertyService.cube - Full versioned cube identifier string.
   * @returns {Object} Configuration object for a stacked segment visualization.
   */
  groupedClassification: function(lfiViewer) {
    const colorMapping = {};

    lfiViewer.propertyService.classificationDimensions.forEach((element, index) => {
      colorMapping[element] = getColor(index);
    });

    const cubeWithVersion = lfiViewer.propertyService.cube;
    const cubeParts = cubeWithVersion.split('/');
    cubeParts.pop();

    const componentId = cubeParts.join('/') + "(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)https://environment.ld.admin.ch/foen/nfi/classificationUnit";

    return {
      segment: {
        componentId: componentId,
        palette: "category10",
        sorting: {
          sortingType: "byAuto",
          sortingOrder: "asc"
        },
        colorMapping: colorMapping,
        type: "stacked"
      }
    };
  },

  /**
   * Returns a filter object for the 'unitOfReference' dimension, either in single
   * or multi form, depending on whether multiple regions should be selected.
   *
   * @function regionFilter
   * @param {Object} lfiViewer - An object containing services like regionService,
   *   visualizationService, etc.
   * @param {boolean} multi - If true, selects all regions under `selectedRegionType`.
   *   Otherwise, uses the single selected region.
   * @returns {Object} A filter object compatible with the visualization config.
   */
  regionFilter: function(lfiViewer, multi) {
    if (multi) {
      const regionValues = {};

      lfiViewer.regionService.regions[
          lfiViewer.regionService.selectedRegionType
          ].forEach((region) => (regionValues[region.value.value] = true));

      return {
        type: 'multi',
        values: regionValues,
      };
    } else {
      return {
        type: 'single',
        value: lfiViewer.regionService.selectedRegion.value.value,
      };
    }
  },
};

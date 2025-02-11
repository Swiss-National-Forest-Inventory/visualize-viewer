import {LINDAS_CACHED_ENDPOINT} from "../config.js";

/**
 * A collection of SPARQL query-generating functions and a helper function to execute
 * those queries against a predefined SPARQL endpoint.
 */

/**
 * An object containing functions that return SPARQL queries for various
 * data retrieval needs (e.g., properties, region hierarchy).
 */
export const queries = {
  /**
   * Returns a SPARQL query string that retrieves key dimension options
   * for the specified language.
   *
   * @function getPropertiesOptions
   * @param {string} lang - The language code (e.g., 'en', 'de', 'fr') for filtering
   *   results based on language-specific labels.
   * @returns {string} A SPARQL query for retrieving properties options.
   */
  getPropertiesOptions: (lang) => `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX schema: <http://schema.org/>
    PREFIX cube: <https://cube.link/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?dimPath ?dimName ?value ?valueName
    FROM <https://lindas.admin.ch/foen/nfi>
    FROM <https://lindas.admin.ch/cube/dimension>
    WHERE {
        ?cube 
          a cube:Cube ;
          cube:observationConstraint ?shape .
        
        FILTER NOT EXISTS { ?cube schema:expires ?ex . }
        
        ?shape sh:property ?dim .
        ?dim 
          schema:name ?dimName ;
          sh:path ?dimPath ;
          rdf:type ?dimType ;
          sh:in/rdf:rest*/rdf:first ?value .
      
        ?value schema:name ?valueName .
    
        FILTER (LANGMATCHES(LANG(?valueName), "${lang}"))
        FILTER (LANGMATCHES(LANG(?dimName), "${lang}"))
        FILTER(?dimType = cube:KeyDimension)
        FILTER(?dimPath NOT IN (cube:observedBy))
        FILTER(?cube NOT IN (<https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1>))
    }
    ORDER BY ?dimPath
    LIMIT 10000
  `,

  /**
   * Returns a SPARQL query string that retrieves cubes and their dimensions
   * for the specified language.
   *
   * @function getPropertiesForCubes
   * @param {string} lang - The language code (e.g., 'en', 'de', 'fr') for filtering
   *   results based on language-specific labels.
   * @returns {string} A SPARQL query for retrieving cubes and their dimensions.
   */
  getPropertiesForCubes: (lang) => `
    PREFIX meta: <https://cube.link/meta/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX schema: <http://schema.org/>
    PREFIX cube: <https://cube.link/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT DISTINCT ?cube ?cubeName ?dimName ?dimPath ?dimType WHERE {
      GRAPH <https://lindas.admin.ch/foen/nfi> {
        ?cube a cube:Cube ;
          schema:name ?cubeName ;
          cube:observationConstraint ?shape .
        
        FILTER NOT EXISTS { ?cube schema:expires ?ex . }
        
        ?shape sh:property ?dim .
        ?dim schema:name ?dimName ;
          sh:path ?dimPath ;
          rdf:type ?dimType .
        
        FILTER(LANG(?dimName) = "${lang}")
        FILTER(LANG(?cubeName) = "${lang}")
        FILTER(?dimPath NOT IN (cube:observedBy, <https://environment.ld.admin.ch/foen/nfi/inventory>, <https://environment.ld.admin.ch/foen/nfi/unitOfReference>))
        FILTER(?cube NOT IN (<https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1>))
      }
    }
    ORDER BY ?dimName
    LIMIT 10000
  `,

  /**
   * Returns a SPARQL query string that retrieves a region hierarchy
   * for the specified language.
   *
   * @function getRegionHierarchy
   * @param {string} lang - The language code (e.g., 'en', 'de', 'fr') for filtering
   *   results based on language-specific labels.
   * @returns {string} A SPARQL query for retrieving the region hierarchy.
   */
  getRegionHierarchy: (lang) => `
    PREFIX meta: <https://cube.link/meta/>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX sh: <http://www.w3.org/ns/shacl#>
    PREFIX schema: <http://schema.org/>
    PREFIX cube: <https://cube.link/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?value ?valueName ?type ?typeName
    WHERE {
      GRAPH <https://lindas.admin.ch/foen/nfi> {
        { SELECT DISTINCT ?value ?root WHERE {
          FILTER NOT EXISTS { ?cube schema:expires ?ex . }
          ?cube a cube:Cube ;
                cube:observationConstraint ?shape .
          ?shape sh:property ?dim .
          ?dim sh:path <https://environment.ld.admin.ch/foen/nfi/unitOfReference> ;
               meta:inHierarchy/meta:hierarchyRoot ?root ;
               sh:in/rdf:rest*/rdf:first ?value .
        }}
        OPTIONAL {
          ?value ^schema:about ?group .
          ?group <https://environment.ld.admin.ch/foen/nfi/subjectOf> ?root ;
                  schema:name ?groupName.
          FILTER (langMatches(lang(?groupName), "${lang}"))
        }
     }
     ?value schema:name ?valueName .
     FILTER (langMatches(lang(?valueName), "${lang}"))
     BIND (COALESCE(?groupName, ?valueName) AS ?typeName)
     BIND (COALESCE(?group, schema:Country) AS ?type)
    }
    ORDER BY ?type ?valueName
    LIMIT 1000
  `,
};

/**
 * Executes a SPARQL query against the LINDAS_CACHED_ENDPOINT, returning the results in JSON format.
 *
 * @async
 * @function queryLindas
 * @param {string} query - The SPARQL query string to execute.
 * @returns {Promise<Object>} A promise resolving to the JSON results of the query.
 */
export async function queryLindas(query) {
  const response = await fetch(LINDAS_CACHED_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
    body: new URLSearchParams({query}).toString(),
  });

  return response.json();
}

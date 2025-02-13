# visualize-viewer

Originally developed by BAFU interims.

Repo: https://gitlab.com/wald.geo/lfi-viewer

Branch: feature/stepper-interface

## NFI-Changes

- Design changes
- Convert to module
- Set default values in [./src/config.js](src/config.js) for:
    - Thema
    - Klassifikationsmerkmal

## Queries

[./src/util/QueryUtil.js](src/util/QueryUtil.js)

### getPropertiesOptions()

Queries the available options for each key dimension property

[https://s.zazuko.com/tBuiHJ](https://s.zazuko.com/tBuiHJ)

```
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

    FILTER (LANGMATCHES(LANG(?valueName), "de"))
    FILTER (LANGMATCHES(LANG(?dimName), "de"))
    FILTER(?dimType = cube:KeyDimension)
    FILTER(?dimPath NOT IN (cube:observedBy))
    FILTER(?cube NOT IN (<https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1>))
}
ORDER BY ?dimPath
LIMIT 10000
```


### getPropertiesForCubes()

Queries property data (both key dimensions and measure dimensions)

https://s.zazuko.com/2TKcYmo

```
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
    
    FILTER(LANG(?dimName) = "de")
    FILTER(LANG(?cubeName) = "de")
    FILTER(?dimPath NOT IN (cube:observedBy, <https://environment.ld.admin.ch/foen/nfi/inventory>, <https://environment.ld.admin.ch/foen/nfi/unitOfReference>))
    FILTER(?cube NOT IN (<https://environment.ld.admin.ch/foen/nfi/nfi_T-changes/cube/2024-1>))
  }
}
ORDER BY ?dimName
LIMIT 10000
```

### getRegionHierarchy()

Queries a list of regions

[https://s.zazuko.com/3baWupz](https://s.zazuko.com/3baWupz)

```
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
      FILTER (langMatches(lang(?groupName), "de"))
    }
 }
 ?value schema:name ?valueName .
 FILTER (langMatches(lang(?valueName), "de"))
 BIND (COALESCE(?groupName, ?valueName) AS ?typeName)
 BIND (COALESCE(?group, schema:Country) AS ?type)
}
ORDER BY ?type ?valueName
LIMIT 1000
```
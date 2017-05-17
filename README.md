# sacrifice_starship_ui
try to make a starship UI instead of using roll20 

### Design Doc

#### Goals, aka "The project will:"

 * Load a galaxy map
   * GM inputs data for each star
     * multiple line items possible, each with visible toggle
   * Gm select visible or not visible
   * GM selects connections, and wheather they are visible
     * point a, point b, length
   * Player can view map visible
   * player can hover to get basic star info (name)
   * player can click to get detailed star info to include:
     * GM input notes section
     * player input notes section (maybe same section)
     * list of planets
       * has attributes for each planet, visible and non visible
     
     
   
 * keep track of starship statistics
   * fuel/energy
   * health
   * relation with various species
   * money at plants
   
 * auth
   * GM email auth
   * player just auth
     * eventual email auth to campaign for multi-campaign support
   * auth not required, but has read-only access 

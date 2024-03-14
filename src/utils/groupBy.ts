export default function groupBy( array: any[] , id: string | number ) {
  let groups = {};
  array.forEach( ( o: { [x: string]: any; } ) => {
      let group = JSON.stringify( o[id] );
      groups[group] = groups[group] || [];
      groups[group].push( o );
  });
  // return Object.keys(groups).map((group)=> {
  //   return groups[group];
  // });
  return Object.values(groups);
}

/**
 * 文件名称
 * @param path 带后缀文件名称
 * @returns
 */
export function getFileName(path: string){
  let pos1 = path.lastIndexOf('/');
  let pos2 = path.lastIndexOf('\\');
  let pos  = Math.max(pos1, pos2);
  if( pos<0 )
      return path;
  else
      return path.substring(pos+1);
}

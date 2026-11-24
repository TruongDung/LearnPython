"use strict";
const { define } = require("./catalog-lesson");
// Each entry supplies its own explanation and algorithm. Reuse only the source
// tracer and picture primitives, so the drawings stay tied to executed states.
function defineEasy(id,title,group,sample,expected,source,guideVi,time,space,options={}) {
  const guideEn=options.guide||options.description||title;
  return define(id,title,group,sample,expected,source,{...options,time,space,
    vi:options.vi||title,guideVi,guide:guideEn,
    teaching:{vi:guideVi,en:guideEn,focus:options.focus||[],diagram:options.diagram||group},
  });
}
module.exports={defineEasy};

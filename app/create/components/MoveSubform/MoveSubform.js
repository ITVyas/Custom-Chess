import NumberInput from "@/app/components/number-input/NumberInput";
import Checkbox from "@/app/components/checkbox/Checkbox";
import { useState } from "react";
import { deepCopy } from "@/app/utils/util";

function getDefaultState() {
    return {
        horizontal: 1,
        vertical: 1,
        repeatPattern: false,
        moveType: {
            move: true,
            take: true
        },
        rotate: {
            once: false,
            twice: false,
            threeTimes: false
        }
    };
}

export default function MoveSubform({collectObject}) {

    const [data, setData] = useState(getDefaultState());

    function updateData(propPath, value) {
        const newData = {...data};
        if(!Array.isArray(propPath)) {
            newData[propPath] = value;
        } else {
            let objectToModify = newData;
            propPath.forEach((prop, i) => {
                if(i <= propPath.length - 2) {
                    if(!objectToModify[prop]) objectToModify[prop] = {};
                    objectToModify = objectToModify[prop];
                } 
                else objectToModify[prop] = value;
            });
        };
        setData(newData);
    }

    collectObject.move = deepCopy(data);

    return (
        <form className="move-fields">
            <div>
                <div className="group-name">Move vector pattern:</div>
                Horizontal / Vertical: 
                <NumberInput max={99} min={-99} name="pattern-horizontal" onInput={(newValue) => updateData('horizontal', newValue)} value={data.horizontal} defaultValue={1} required={true}/>
                <NumberInput max={99} min={-99} name="pattern-vertical" onInput={(newValue) => updateData('vertical', newValue)} value={data.vertical} defaultValue={1} required={true}/>
            </div>
            <Checkbox className={'bold-label'} id="repeat-pattern" name="repeat-pattern" labelText={'Repeat pattern'} checked={data.repeatPattern} onChange={(newValue) => updateData('repeatPattern', newValue)} />
            <div id="move-type-field">
                <div className="group-name">Move type:</div>
                <Checkbox id="taking-move-type" name="taking-move-type" labelText={'Taking'} checked={data.moveType.take} onChange={(newValue) => updateData(['moveType', 'take'], newValue)} />
                <Checkbox id="moving-move-type" name="moving-move-type" labelText={'Moving'} checked={data.moveType.move} onChange={(newValue) => updateData(['moveType', 'move'], newValue)} />
            </div>
            <div>
                <div className="group-name">Rotate clockwise:</div>
                <Checkbox id='rotate-once' name='rotate-once' labelText={'90 deg'} checked={data.rotate.once} onChange={(newValue) => updateData(['rotate', 'once'], newValue)} />
                <Checkbox id='rotate-twice' name='rotate-twice' labelText={'180 deg'} checked={data.rotate.twice} onChange={(newValue) => updateData(['rotate', 'twice'], newValue)} />
                <Checkbox id='rotate-three-times' name='rotate-three-times' labelText={'270 deg'} checked={data.rotate.threeTimes} onChange={(newValue) => updateData(['rotate', 'threeTimes'], newValue)} />
            </div>
        </form>
    );
}
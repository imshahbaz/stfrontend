import React from 'react';
import { priceActionAPI } from '../../api/axios';
import GenericPriceActionTab from './GenericPriceActionTab';

const FvgTab = () => {
    return (
        <GenericPriceActionTab
            type="fvg"
            title="FVG"
            fetchKey="fvg"
            apiMethods={{
                create: priceActionAPI.createFVG,
                update: priceActionAPI.updateFVG,
                delete: priceActionAPI.deleteFVG,
                get: priceActionAPI.getPriceActionBySymbol
            }}
            refreshApiMethod={priceActionAPI.refreshFvgMitigationData}
        />
    );
};

export default FvgTab;

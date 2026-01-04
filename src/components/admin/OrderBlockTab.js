import React from 'react';
import { priceActionAPI } from '../../api/axios';
import GenericPriceActionTab from './GenericPriceActionTab';

const OrderBlockTab = () => {
    return (
        <GenericPriceActionTab
            type="ob"
            title="Order Block"
            fetchKey="orderBlocks"
            apiMethods={{
                create: priceActionAPI.createOrderBlock,
                update: priceActionAPI.updateOrderBlock,
                delete: priceActionAPI.deleteOrderBlock,
                get: priceActionAPI.getPriceActionBySymbol
            }}
            refreshApiMethod={priceActionAPI.refreshMitigationData}
        />
    );
};

export default OrderBlockTab;
